import { useEffect, useMemo, useState } from "react"

import { EditModal } from "~components/EditModal"
import { Header } from "~components/Header"
import { JwtModal } from "~components/JwtModal"
import { LogDetail } from "~components/LogDetail"
import { LogItem } from "~components/LogItem"
import { SearchBar } from "~components/SearchBar"
import { StatsSidebar } from "~components/StatsSidebar"
import { Toast } from "~components/Toast"
import { useLogs } from "~hooks/useLogs"
import type { RequestLog } from "~types"
import {
  decodeJwt,
  downloadAllLogs,
  downloadSingleResponse,
  getJwtFromLog
} from "~utils/helpers"

function IndexSidePanel() {
  const {
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
  } = useLogs()

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [editingLog, setEditingLog] = useState<RequestLog | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const handleCopy = (id: string, text: string, typeName = "コピー") => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setToast(`${typeName}をクリップボードにコピーしました`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleReplay = (log: RequestLog) => {
    chrome.runtime.sendMessage({
      type: "REPLAY_REQUEST",
      payload: log
    })
    setToast("リクエストを再試行しています...")
  }

  const handleSendEditedRequest = (editedLog: RequestLog) => {
    chrome.runtime.sendMessage({
      type: "REPLAY_REQUEST",
      payload: editedLog
    })
    setEditingLog(null)
    setToast("編集したリクエストを送信しました")
  }

  const jwtDetails = useMemo(() => {
    try {
      if (!activeJwtLog) return null
      const token = getJwtFromLog(activeJwtLog)
      if (!token) return null
      return decodeJwt(token)
    } catch (e) {
      console.error("[API-Xray] JWT Detail error:", e)
      return null
    }
  }, [activeJwtLog])

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        padding: "16px",
        backgroundColor: "#0f0f11",
        color: "#e4e4e7",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: #0f0f11;
        }
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
        * {
          box-sizing: border-box;
        }
        .log-item {
          font-size: 11px;
          padding: 8px 10px;
          background-color: #18181b;
          border: none;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.15s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .log-item:hover {
          background-color: #202024;
        }
        .log-item.selected {
          background-color: #1c1c1f;
        }
        .tab-btn {
          background-color: transparent;
          border: none;
          color: #a1a1aa;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tab-btn:hover {
          color: #f4f4f5;
          background-color: rgba(255,255,255,0.05);
        }
        .tab-btn.active {
          background-color: #27272a;
          color: #f4f4f5;
          font-weight: bold;
        }
        .clear-btn {
          background-color: #18181b;
          border: none;
          color: #a1a1aa;
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }
        .clear-btn:hover {
          background-color: #27272a;
          color: #f4f4f5;
        }
        .clear-btn.danger:hover {
          background-color: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 8px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @media (max-width: 599px) {
          .columns-area {
            flex-direction: column !important;
          }
          .stats-column {
            width: 100% !important;
            margin-top: 16px;
            height: 240px !important;
            flex-shrink: 0 !important;
          }
          .history-column {
            flex: 1 !important;
          }
        }
      `}</style>

      <Header
        tabRequestCount={filteredLogs.length}
        onExport={() => downloadAllLogs(logs, currentTabId)}
        onClear={clearLogs}
      />

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterChange={setFilterType}
        statusGroup={statusGroup}
        onStatusGroupChange={setStatusGroup}
      />

      <div
        className="columns-area"
        style={{ display: "flex", gap: "16px", flex: 1, overflow: "hidden" }}>
        <div
          className="history-column"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            overflow: "hidden",
            height: "100%"
          }}>
          <div
            style={{
              fontSize: "11px",
              color: "#71717a",
              fontWeight: "bold",
              paddingBottom: "2px"
            }}>
            REQUEST HISTORY
          </div>
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              paddingRight: "4px"
            }}>
            {filteredLogs.length === 0 && (
              <div
                style={{
                  color: "#71717a",
                  textAlign: "center",
                  marginTop: "30px",
                  fontSize: "11px"
                }}>
                No requests captured for this tab.
              </div>
            )}
            {filteredLogs.map((log) => {
              const isSelected = selectedId === log.requestId

              return (
                <div
                  key={log.requestId}
                  style={{ display: "flex", flexDirection: "column" }}>
                  <LogItem
                    log={log}
                    isSelected={isSelected}
                    onSelect={() =>
                      setSelectedId(isSelected ? null : log.requestId)
                    }
                    onJwtClick={(e) => {
                      e.stopPropagation()
                      setActiveJwtLog(log)
                    }}
                  />

                  {isSelected && (
                    <LogDetail
                      log={log}
                      isCopied={copiedId === log.requestId}
                      isCurlCopied={copiedId === `${log.requestId}_curl`}
                      onCopy={(text, type) =>
                        handleCopy(log.requestId, text, type)
                      }
                      onCopyCurl={(text) =>
                        handleCopy(
                          `${log.requestId}_curl`,
                          text,
                          "cURLコマンド"
                        )
                      }
                      onDownload={() => downloadSingleResponse(log)}
                      onReplay={() => handleReplay(log)}
                      onEdit={() => setEditingLog(log)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <StatsSidebar stats={stats} />
      </div>

      {activeJwtLog && jwtDetails && (
        <JwtModal
          jwtDetails={jwtDetails}
          isCopied={copiedId === "jwt_token"}
          onClose={() => setActiveJwtLog(null)}
          onCopy={(text, type) => handleCopy("jwt_token", text, type)}
        />
      )}

      {editingLog && (
        <EditModal
          log={editingLog}
          onClose={() => setEditingLog(null)}
          onSend={handleSendEditedRequest}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  )
}

export default IndexSidePanel
