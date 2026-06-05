import React from "react"

interface HeaderProps {
  tabRequestCount: number
  onExport: () => void
  onClear: () => void
}

export const Header: React.FC<HeaderProps> = ({
  tabRequestCount,
  onExport,
  onClear
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
        paddingBottom: "8px"
      }}>
      <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
        API-Xray{" "}
        <span
          style={{ fontSize: "11px", color: "#71717a", fontWeight: "normal" }}>
          Console
        </span>
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{ fontSize: "10px", color: "#71717a", marginRight: "4px" }}>
          Tab Req: {tabRequestCount}
        </span>
        <button
          className="clear-btn"
          onClick={onExport}
          title="Export tab logs to JSON">
          Export
        </button>
        <button className="clear-btn danger" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  )
}
