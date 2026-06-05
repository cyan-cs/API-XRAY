import type { RequestLog } from "~types"
import { decryptData, encryptData } from "~utils/encryption"

export {}

export type { RequestLog }

let logs: RequestLog[] = []
const MAX_LOGS = 100
const STORAGE_KEY = "api_xray_logs_encrypted"
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"]

async function loadLogs() {
  try {
    const stored = await chrome.storage.local.get(STORAGE_KEY)
    if (stored[STORAGE_KEY]) {
      const decrypted = await decryptData(stored[STORAGE_KEY])
      if (decrypted) {
        logs = JSON.parse(decrypted)
      }
    }
  } catch (e) {
    console.error("Failed to load logs:", e)
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function saveLogs() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    try {
      const encrypted = await encryptData(JSON.stringify(logs))
      await chrome.storage.local.set({ [STORAGE_KEY]: encrypted })
    } catch (e) {
      console.error("Failed to save logs:", e)
    }
  }, 1000)
}

loadLogs()

const requestHeaders = new Map<string, chrome.webRequest.HttpHeader[]>()

function findLogIndex(
  log: Pick<RequestLog, "url" | "method" | "timeStamp"> & {
    requestId?: string
  }
) {
  return logs.findIndex(
    (item) =>
      (log.requestId && item.requestId === log.requestId) ||
      (item.url === log.url &&
        item.method === log.method &&
        Math.abs(item.timeStamp - log.timeStamp) < 2000)
  )
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_LOGS") {
    sendResponse(logs)
  } else if (message.type === "CLEAR_LOGS") {
    logs.length = 0
    requestHeaders.clear()
    saveLogs()
    chrome.runtime.sendMessage({ type: "LOGS_CLEARED" }).catch(() => {})
    sendResponse(true)
  } else if (message.type === "REPLAY_REQUEST") {
    const log = message.payload as RequestLog
    if (log.tabId) {
      chrome.tabs
        .sendMessage(log.tabId, {
          type: "PERFORM_REPLAY",
          payload: log
        })
        .catch(() => {})
    }
    sendResponse(true)
  } else if (message.type === "REQUEST_CAPTURED") {
    const captured = message.payload
    const tabId = sender.tab?.id

    if (!captured.responseBody || typeof captured.responseBody !== "object")
      return

    const existingIndex = findLogIndex(captured)

    if (existingIndex !== -1) {
      logs[existingIndex] = {
        ...logs[existingIndex],
        ...captured,
        tabId: logs[existingIndex].tabId || tabId,
        requestHeaders:
          logs[existingIndex].requestHeaders || captured.requestHeaders,
        responseHeaders:
          logs[existingIndex].responseHeaders || captured.responseHeaders
      }
      saveLogs()
      chrome.runtime
        .sendMessage({
          type: "UPDATE_REQUEST",
          payload: logs[existingIndex]
        })
        .catch(() => {})
    } else if (METHODS.includes(captured.method.toUpperCase())) {
      const log = {
        ...captured,
        tabId,
        requestId: captured.requestId || `cs-${Date.now()}`
      }
      logs.unshift(log)
      if (logs.length > MAX_LOGS) logs.pop()
      saveLogs()
      chrome.runtime
        .sendMessage({ type: "NEW_REQUEST", payload: log })
        .catch(() => {})
    }
  }
})

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (
      ["xmlhttprequest", "fetch"].includes(details.type) &&
      METHODS.includes(details.method.toUpperCase())
    ) {
      requestHeaders.set(details.requestId, details.requestHeaders || [])
      setTimeout(() => requestHeaders.delete(details.requestId), 30000)
    }
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders"]
)

chrome.webRequest.onCompleted.addListener(
  (details) => {
    const contentType = details.responseHeaders
      ?.find((header) => header.name.toLowerCase() === "content-type")
      ?.value?.toLowerCase()

    if (!contentType?.includes("application/json")) {
      requestHeaders.delete(details.requestId)
      return
    }

    const headers = requestHeaders.get(details.requestId)
    const isReplay = headers?.some(
      (h) => h.name.toLowerCase() === "x-api-xray-is-replay"
    )

    if (headers) {
      requestHeaders.delete(details.requestId)
    }

    const existingIndex = findLogIndex(details)

    if (existingIndex !== -1) {
      logs[existingIndex].status = details.statusCode
      logs[existingIndex].responseHeaders = details.responseHeaders
      if (headers) {
        logs[existingIndex].requestHeaders = headers
      }
      if (isReplay) {
        logs[existingIndex].isReplay = true
      }
      logs[existingIndex].requestId = details.requestId
      if (details.tabId !== -1) {
        logs[existingIndex].tabId = details.tabId
      }

      saveLogs()
      chrome.runtime
        .sendMessage({ type: "UPDATE_REQUEST", payload: logs[existingIndex] })
        .catch(() => {})
    } else {
      const log: RequestLog = {
        requestId: details.requestId,
        method: details.method,
        url: details.url,
        timeStamp: details.timeStamp,
        type: details.type,
        status: details.statusCode,
        responseHeaders: details.responseHeaders,
        requestHeaders: headers,
        tabId: details.tabId,
        isReplay: isReplay
      }
      logs.unshift(log)
      if (logs.length > MAX_LOGS) logs.pop()
      saveLogs()
      chrome.runtime
        .sendMessage({ type: "NEW_REQUEST", payload: log })
        .catch(() => {})
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
)

if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) =>
      console.error("Error setting side panel behavior:", error)
    )
}
