import React from "react"

import type { RequestLog } from "~types"
import { generateCurlCommand } from "~utils/helpers"

import { JsonTree } from "./JsonTree"

interface LogDetailProps {
  log: RequestLog
  isCopied: boolean
  isCurlCopied: boolean
  onCopy: (text: string, type: string) => void
  onCopyCurl: (text: string) => void
  onDownload: () => void
  onReplay: () => void
  onEdit: () => void
}

export const LogDetail: React.FC<LogDetailProps> = ({
  log,
  isCopied,
  isCurlCopied,
  onCopy,
  onCopyCurl,
  onDownload,
  onReplay,
  onEdit
}) => {
  return (
    <div
      style={{
        backgroundColor: "#09090b",
        padding: "10px",
        marginTop: "4px",
        fontSize: "10px",
        borderRadius: "6px",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "6px",
          gap: "8px",
          borderBottom: "1px solid #1c1c1f"
        }}>
        <span
          style={{
            color: "#60a5fa",
            wordBreak: "break-all",
            fontSize: "9px",
            flex: 1
          }}>
          {log.url}
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={onReplay}
            onContextMenu={(e) => {
              e.preventDefault()
              onEdit()
            }}
            title="Left-click: Replay instantly | Right-click: Edit and Replay"
            style={{
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              color: "#a5b4fc",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "9px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontWeight: "bold"
            }}>
            🔄 Replay
          </button>
          <button
            onClick={() =>
              onCopy(
                JSON.stringify(log.responseBody, null, 2),
                "レスポンスJSON"
              )
            }
            style={{
              backgroundColor: "#18181b",
              border: "none",
              color: "#a1a1aa",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "9px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}>
            {isCopied ? "Copied! ✓" : "Copy"}
          </button>
          <button
            onClick={() => onCopyCurl(generateCurlCommand(log))}
            style={{
              backgroundColor: "#18181b",
              border: "none",
              color: "#a1a1aa",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "9px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}>
            {isCurlCopied ? "Copied cURL! ✓" : "cURL"}
          </button>
          <button
            onClick={onDownload}
            style={{
              backgroundColor: "#18181b",
              border: "none",
              color: "#a1a1aa",
              borderRadius: "4px",
              padding: "4px 8px",
              fontSize: "9px",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}>
            📥
          </button>
        </div>
      </div>

      {log.requestBody && (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              color: "#e4e4e7",
              fontSize: "9px",
              fontWeight: "bold"
            }}>
            Request Body:
          </div>
          <div
            style={{
              backgroundColor: "#131316",
              padding: "8px",
              borderRadius: "4px",
              maxHeight: "120px",
              overflowY: "auto"
            }}>
            <JsonTree data={log.requestBody} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <div
          style={{
            color: "#e4e4e7",
            fontSize: "9px",
            fontWeight: "bold"
          }}>
          Response Body:
        </div>
        <div
          style={{
            backgroundColor: "#131316",
            padding: "8px",
            borderRadius: "4px",
            maxHeight: "300px",
            overflowY: "auto"
          }}>
          {log.responseBody ? (
            <JsonTree data={log.responseBody} />
          ) : (
            <div style={{ color: "#71717a", fontSize: "10px" }}>
              No body captured
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
