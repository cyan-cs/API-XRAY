import React, { useMemo } from "react"

import { formatUrl, getMethodStyle } from "~utils/helpers"

interface StatsSidebarProps {
  stats: Array<{ method: string; url: string; count: number }>
}

export const StatsSidebar: React.FC<StatsSidebarProps> = ({ stats }) => {
  const maxStatCount = useMemo(() => {
    return stats.reduce((max, item) => (item.count > max ? item.count : max), 1)
  }, [stats])

  return (
    <div
      className="stats-column"
      style={{
        width: "240px",
        flexShrink: 0,
        backgroundColor: "#131316",
        borderRadius: "8px",
        padding: "12px",
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
        CALL FREQUENCY
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          paddingRight: "4px"
        }}>
        {stats.length === 0 && (
          <div
            style={{
              color: "#71717a",
              fontSize: "10px",
              textAlign: "center",
              marginTop: "30px"
            }}>
            No data.
          </div>
        )}
        {stats.map((item, i) => {
          const statUrlInfo = formatUrl(item.url)
          const methodStyle = getMethodStyle(item.method)
          const percentWidth = `${(item.count / maxStatCount) * 100}%`

          return (
            <div
              key={i}
              style={{
                fontSize: "10px",
                padding: "6px 8px",
                backgroundColor: "#18181b",
                borderRadius: "6px",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: percentWidth,
                  backgroundColor: "rgba(99, 102, 241, 0.06)",
                  borderRight: "2px solid rgba(99, 102, 241, 0.2)",
                  zIndex: 0,
                  pointerEvents: "none"
                }}
              />

              <div
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1,
                  marginRight: "6px",
                  display: "flex",
                  alignItems: "center",
                  zIndex: 1
                }}>
                <span
                  style={{
                    backgroundColor: methodStyle.bg,
                    color: methodStyle.text,
                    padding: "1px 3px",
                    borderRadius: "3px",
                    fontSize: "8px",
                    fontWeight: "bold",
                    marginRight: "6px",
                    display: "inline-block"
                  }}>
                  {item.method}
                </span>
                <div
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1
                  }}>
                  <span
                    style={{
                      color: "#71717a",
                      fontSize: "8.5px",
                      marginRight: "3px"
                    }}>
                    {statUrlInfo.host}
                  </span>
                  <span style={{ color: "#e4e4e7" }} title={item.url}>
                    {statUrlInfo.path}
                  </span>
                </div>
              </div>

              <span
                style={{
                  backgroundColor: "#27272a",
                  padding: "1px 5px",
                  borderRadius: "8px",
                  fontSize: "9px",
                  fontWeight: "bold",
                  color: "#ffab40",
                  zIndex: 1
                }}>
                {item.count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
