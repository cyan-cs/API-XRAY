import { useEffect, useMemo, useState } from "react"

import type { FilterType, RequestLog } from "~types"
import { hasJwt } from "~utils/helpers"

export type StatusGroup = "ALL" | "2xx" | "3xx" | "4xx" | "5xx"

export function useLogs() {
  const [logs, setLogs] = useState<RequestLog[]>([])
  const [currentTabId, setCurrentTabId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("ALL")
  const [statusGroup, setStatusGroup] = useState<StatusGroup>("ALL")

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeJwtLog, setActiveJwtLog] = useState<RequestLog | null>(null)

  useEffect(() => {
    const updateActiveTab = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          setCurrentTabId(tabs[0].id)
        }
      })
    }

    updateActiveTab()

    const onTabChange = () => updateActiveTab()
    chrome.tabs.onActivated.addListener(onTabChange)
    chrome.tabs.onUpdated.addListener(onTabChange)

    chrome.runtime.sendMessage({ type: "GET_LOGS" }, (response) => {
      if (response) setLogs(response)
    })

    const listener = (message: { type: string; payload: RequestLog }) => {
      if (message.type === "NEW_REQUEST") {
        setLogs((prev) => [message.payload, ...prev].slice(0, 100))
      } else if (message.type === "UPDATE_REQUEST") {
        setLogs((prev) =>
          prev.map((log) =>
            log.requestId === message.payload.requestId ||
            (log.url === message.payload.url &&
              log.method === message.payload.method &&
              Math.abs(log.timeStamp - message.payload.timeStamp) < 2000)
              ? message.payload
              : log
          )
        )
      } else if (message.type === "LOGS_CLEARED") {
        setLogs([])
        setSelectedId(null)
        setActiveJwtLog(null)
      }
    }

    chrome.runtime.onMessage.addListener(listener)

    return () => {
      chrome.tabs.onActivated.removeListener(onTabChange)
      chrome.tabs.onUpdated.removeListener(onTabChange)
      chrome.runtime.onMessage.removeListener(listener)
    }
  }, [])

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (currentTabId !== null && log.tabId !== currentTabId) return false

      const query = searchTerm.toLowerCase()
      if (
        query &&
        !log.url.toLowerCase().includes(query) &&
        !log.method.toLowerCase().includes(query)
      ) {
        return false
      }

      if (statusGroup !== "ALL") {
        const status = log.status || 0
        if (statusGroup === "2xx" && (status < 200 || status >= 300))
          return false
        if (statusGroup === "3xx" && (status < 300 || status >= 400))
          return false
        if (statusGroup === "4xx" && (status < 400 || status >= 500))
          return false
        if (statusGroup === "5xx" && status < 500) return false
      }

      if (filterType === "ERRORS") {
        return log.status && log.status >= 400
      }
      if (filterType === "JWT") {
        return hasJwt(log)
      }

      return true
    })
  }, [logs, currentTabId, searchTerm, statusGroup, filterType])

  const stats = useMemo(() => {
    const counts: Record<
      string,
      { method: string; url: string; count: number }
    > = {}
    logs.forEach((log) => {
      if (currentTabId !== null && log.tabId !== currentTabId) return

      const key = `${log.method}:${log.url}`
      if (!counts[key]) {
        counts[key] = { method: log.method, url: log.url, count: 0 }
      }
      counts[key].count++
    })
    return Object.values(counts).sort((a, b) => b.count - a.count)
  }, [logs, currentTabId])

  const clearLogs = () => {
    chrome.runtime.sendMessage({ type: "CLEAR_LOGS" })
  }

  return {
    logs,
    filteredLogs,
    stats,
    currentTabId,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    statusGroup,
    setStatusGroup,
    selectedId,
    setSelectedId,
    activeJwtLog,
    setActiveJwtLog,
    clearLogs
  }
}
