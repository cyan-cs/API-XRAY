import type { DecodedJwt, RequestLog } from "~types"

export const hasJwt = (log: RequestLog) => {
  const authHeader = log.requestHeaders?.find(
    (h) => h.name.toLowerCase() === "authorization"
  )
  return authHeader?.value?.toLowerCase().includes("bearer") || false
}

export const getJwtFromLog = (log: RequestLog): string | null => {
  const authHeader = log.requestHeaders?.find(
    (h) => h.name.toLowerCase() === "authorization"
  )
  const value = authHeader?.value
  if (!value) return null

  if (value.toLowerCase().startsWith("bearer ")) {
    return value.slice(7).trim()
  }

  if (value.split(".").length === 3) {
    return value.trim()
  }

  return null
}

export const decodeJwt = (token: string): DecodedJwt | null => {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const decodePart = (part: string) => {
      let base64 = part.replace(/-/g, "+").replace(/_/g, "/")
      while (base64.length % 4) base64 += "="

      return decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
          .join("")
      )
    }

    return {
      header: JSON.parse(decodePart(parts[0])),
      payload: JSON.parse(decodePart(parts[1])),
      token
    }
  } catch {
    return null
  }
}

export const extractPermissions = (payload: unknown): string[] => {
  if (!payload || typeof payload !== "object") return []

  const data = payload as Record<string, unknown>
  const permissions: string[] = []

  for (const key of ["scope", "scp"]) {
    const value = data[key]
    if (typeof value === "string") {
      permissions.push(...value.split(" "))
    } else if (Array.isArray(value)) {
      permissions.push(...value.map(String))
    }
  }

  for (const key of ["roles", "role"]) {
    const value = data[key]
    if (typeof value === "string") {
      permissions.push(`role:${value}`)
    } else if (Array.isArray(value)) {
      permissions.push(...value.map((role) => `role:${role}`))
    }
  }

  const realmAccess = data.realm_access as Record<string, unknown> | undefined
  if (Array.isArray(realmAccess?.roles)) {
    permissions.push(...realmAccess.roles.map((role) => `realm:${role}`))
  }

  return Array.from(new Set(permissions)).filter(Boolean)
}

export const getExpirationInfo = (payload: unknown) => {
  const fallback = {
    status: "No Expiry",
    color: "#a1a1aa",
    text: "This token does not contain an expiration claim."
  }

  if (!payload || typeof payload !== "object") return fallback

  const data = payload as Record<string, unknown>
  if (typeof data.exp !== "number") return fallback

  const expTime = data.exp * 1000
  const diff = expTime - Date.now()
  const date = new Date(expTime).toLocaleString()

  if (diff <= 0) {
    return {
      status: "Expired",
      color: "#ef4444",
      text: `Expired on ${date}`
    }
  }

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  const remaining =
    hours > 0
      ? `${hours}h ${remainingMinutes}m remaining`
      : `${minutes}m remaining`

  return {
    status: "Active",
    color: "#10b981",
    text: `Expires on ${date} (${remaining})`
  }
}

export const generateCurlCommand = (log: RequestLog) => {
  // Proper shell escaping for single quotes (most reliable for curl)
  const shellEscape = (str: string): string => {
    return "'" + str.replace(/'/g, "'\\''") + "'"
  }

  let curl = `curl ${shellEscape(log.url)}`
  const method = log.method.toUpperCase()

  if (method !== "GET") {
    curl += ` -X ${method}`
  }

  log.requestHeaders?.forEach((header) => {
    const name = header.name.toLowerCase()
    if (name.startsWith(":") || name === "x-api-xray-is-replay") return

    const headerValue = `${header.name}: ${header.value || ""}`
    curl += ` -H ${shellEscape(headerValue)}`
  })

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    let body = ""
    if (log.requestBody !== undefined && log.requestBody !== null) {
      body =
        typeof log.requestBody === "object"
          ? JSON.stringify(log.requestBody)
          : String(log.requestBody)
    }

    if (body || method === "POST") {
      curl += ` --data-raw ${shellEscape(body)}`
    }
  }

  return curl
}

export const formatUrl = (urlStr: string) => {
  try {
    const url = new URL(urlStr)
    return {
      host: url.host,
      path: url.pathname + url.search
    }
  } catch {
    return {
      host: "",
      path: urlStr
    }
  }
}

export const getMethodStyle = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET":
      return { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa" }
    case "POST":
      return { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399" }
    case "PUT":
    case "PATCH":
      return { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24" }
    case "DELETE":
      return { bg: "rgba(239, 68, 68, 0.15)", text: "#f87171" }
    default:
      return { bg: "rgba(107, 114, 128, 0.15)", text: "#9ca3af" }
  }
}

export const getStatusColor = (status?: number) => {
  if (!status) return "#71717a"
  if (status < 300) return "#10b981"
  if (status < 400) return "#3b82f6"
  return "#ef4444"
}

export const downloadAllLogs = (
  logs: RequestLog[],
  currentTabId: number | null
) => {
  const activeTabLogs = logs.filter(
    (log) => currentTabId === null || log.tabId === currentTabId
  )
  const data =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(activeTabLogs, null, 2))

  const anchor = document.createElement("a")
  anchor.href = data
  anchor.download = `api_xray_tab_${currentTabId}_logs_${Date.now()}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export const downloadSingleResponse = (log: RequestLog) => {
  const data =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(log.responseBody, null, 2))
  const path = formatUrl(log.url).path.replace(/[^a-z0-9]/gi, "_")

  const anchor = document.createElement("a")
  anchor.href = data
  anchor.download = `${log.method}_${path}_response.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}
