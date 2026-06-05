import type { PlasmoCSConfig } from "plasmo"

import type { RequestLog } from "~types"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const FORBIDDEN_HEADERS = new Set([
  "accept-charset",
  "accept-encoding",
  "access-control-request-headers",
  "access-control-request-method",
  "connection",
  "content-length",
  "cookie",
  "cookie2",
  "date",
  "dnt",
  "expect",
  "host",
  "keep-alive",
  "origin",
  "referer",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "via"
])

window.addEventListener("message", (event) => {
  if (event.source !== window) return

  if (event.data?.type === "API_XRAY_CAPTURED") {
    chrome.runtime
      .sendMessage({
        type: "REQUEST_CAPTURED",
        payload: event.data.payload
      })
      .catch(() => {})
  }
})

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "PERFORM_REPLAY") {
    replay(message.payload as RequestLog)
  }
})

async function replay(log: RequestLog) {
  const headers = new Headers()

  log.requestHeaders?.forEach((h) => {
    const name = h.name?.toLowerCase()
    if (
      !name ||
      name.startsWith(":") ||
      name.startsWith("proxy-") ||
      name.startsWith("sec-") ||
      FORBIDDEN_HEADERS.has(name)
    ) {
      return
    }

    if (h.value) headers.append(h.name, h.value)
  })

  headers.append("X-API-Xray-Is-Replay", "true")

  let body: BodyInit | undefined
  if (log.requestBody !== undefined && log.requestBody !== null) {
    body =
      typeof log.requestBody === "object"
        ? JSON.stringify(log.requestBody)
        : String(log.requestBody)
  }

  try {
    const response = await fetch(log.url, {
      method: log.method,
      headers,
      body,
      mode: "cors",
      credentials: "include"
    })

    console.log(`[API-Xray] Replayed: ${log.url}`, response.status)
  } catch (error) {
    console.error("[API-Xray] Replay failed:", error)
  }
}
