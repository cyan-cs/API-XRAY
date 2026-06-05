import React, { useState } from "react"

import type { RequestLog } from "~types"

interface EditModalProps {
  log: RequestLog
  onClose: () => void
  onSend: (editedLog: RequestLog) => void
}

export const EditModal: React.FC<EditModalProps> = ({
  log,
  onClose,
  onSend
}) => {
  const [method, setMethod] = useState(log.method)
  const [url, setUrl] = useState(log.url)

  const [headersText, setHeadersText] = useState(() => {
    if (!log.requestHeaders) return ""
    return log.requestHeaders
      .filter((h) => !h.name.startsWith(":"))
      .map((h) => `${h.name}: ${h.value}`)
      .join("\n")
  })

  const [bodyText, setBodyText] = useState(() => {
    if (!log.requestBody) return ""
    return typeof log.requestBody === "object"
      ? JSON.stringify(log.requestBody, null, 2)
      : String(log.requestBody)
  })

  const handleSend = () => {
    const headers = headersText
      .split("\n")
      .filter((line) => line.includes(":"))
      .map((line) => {
        const [name, ...valueParts] = line.split(":")
        return {
          name: name.trim(),
          value: valueParts.join(":").trim()
        }
      })

    let body: unknown = bodyText
    try {
      if (bodyText.trim().startsWith("{") || bodyText.trim().startsWith("[")) {
        body = JSON.parse(bodyText)
      }
    } catch {
      body = bodyText
    }

    const editedLog: RequestLog = {
      ...log,
      method,
      url,
      requestHeaders: headers,
      requestBody: body,
      isReplay: true
    }

    onSend(editedLog)
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(9, 9, 11, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: "16px"
      }}>
      <div
        style={{
          backgroundColor: "#18181b",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "600px",
          maxHeight: "90%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          border: "1px solid #27272a"
        }}>
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #27272a",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#1c1c1f"
          }}>
          <h4
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: "bold",
              color: "#a5b4fc"
            }}>
            🛠️ Request Editor (Repeater)
          </h4>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#71717a",
              cursor: "pointer",
              fontSize: "18px"
            }}>
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "16px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              style={{
                backgroundColor: "#09090b",
                color: "#e4e4e7",
                border: "1px solid #27272a",
                borderRadius: "6px",
                padding: "8px",
                fontSize: "12px",
                outline: "none"
              }}>
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: "#09090b",
                color: "#e4e4e7",
                border: "1px solid #27272a",
                borderRadius: "6px",
                padding: "8px",
                fontSize: "12px",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
              style={{
                fontSize: "11px",
                color: "#71717a",
                fontWeight: "bold"
              }}>
              HEADERS (Key: Value)
            </label>
            <textarea
              value={headersText}
              onChange={(e) => setHeadersText(e.target.value)}
              placeholder="Content-Type: application/json"
              style={{
                height: "120px",
                backgroundColor: "#09090b",
                color: "#a5d6ff",
                border: "1px solid #27272a",
                borderRadius: "6px",
                padding: "8px",
                fontSize: "11px",
                fontFamily: "monospace",
                resize: "vertical",
                outline: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
              style={{
                fontSize: "11px",
                color: "#71717a",
                fontWeight: "bold"
              }}>
              REQUEST BODY
            </label>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder='{"key": "value"}'
              style={{
                height: "160px",
                backgroundColor: "#09090b",
                color: "#fbbf24",
                border: "1px solid #27272a",
                borderRadius: "6px",
                padding: "8px",
                fontSize: "11px",
                fontFamily: "monospace",
                resize: "vertical",
                outline: "none"
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid #27272a",
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            backgroundColor: "#1c1c1f"
          }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              color: "#a1a1aa",
              border: "1px solid #27272a",
              padding: "6px 16px",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer"
            }}>
            Cancel
          </button>
          <button
            onClick={handleSend}
            style={{
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              padding: "6px 20px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "bold",
              cursor: "pointer"
            }}>
            🚀 Send Request
          </button>
        </div>
      </div>
    </div>
  )
}
