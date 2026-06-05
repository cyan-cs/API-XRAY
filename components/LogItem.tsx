import React from "react"

import type { RequestLog } from "~types"
import {
  formatUrl,
  getMethodStyle,
  getStatusColor,
  hasJwt
} from "~utils/helpers"

interface LogItemProps {
  log: RequestLog
  isSelected: boolean
  onSelect: () => void
  onJwtClick: (e: React.MouseEvent) => void
}

export const LogItem: React.FC<LogItemProps> = ({
  log,
  isSelected,
  onSelect,
  onJwtClick
}) => {
  const urlInfo = formatUrl(log.url)
  const methodStyle = getMethodStyle(log.method)

  return (
    <div
      className={`log-item ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
      style={{
        borderLeft: `3px solid ${getStatusColor(log.status)}`
      }}>
      <div
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
          marginRight: "8px",
          display: "flex",
          alignItems: "center"
        }}>
        <span
          style={{
            backgroundColor: methodStyle.bg,
            color: methodStyle.text,
            padding: "2px 5px",
            borderRadius: "4px",
            fontSize: "8px",
            fontWeight: "bold",
            marginRight: "8px",
            minWidth: "46px",
            textAlign: "center",
            display: "inline-block"
          }}>
          {log.method}
        </span>
        <div
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            fontSize: "11px"
          }}>
          <span
            style={{ color: "#71717a", fontSize: "10px", marginRight: "4px" }}>
            {urlInfo.host}
          </span>
          <span style={{ color: "#e4e4e7" }} title={log.url}>
            {urlInfo.path}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {log.isReplay && (
          <span
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              color: "#a5b4fc",
              padding: "2px 4px",
              borderRadius: "3px",
              fontSize: "8px",
              fontWeight: "bold",
              border: "1px solid rgba(99, 102, 241, 0.3)"
            }}>
            REPLAYED
          </span>
        )}
        {hasJwt(log) && (
          <span
            title="Authorization Token Detected - Click to View Claims & Expiry"
            onClick={onJwtClick}
            style={{
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              padding: "2px 5px",
              borderRadius: "3px",
              border: "none",
              fontSize: "8px",
              color: "#fbbf24",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.15s"
            }}>
            🔑 JWT
          </span>
        )}
        <span
          style={{
            color: getStatusColor(log.status),
            fontWeight: "bold",
            fontSize: "11px",
            minWidth: "22px",
            textAlign: "right"
          }}>
          {log.status || "..."}
        </span>
      </div>
    </div>
  )
}
