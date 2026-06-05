import React, { useState } from "react"

import type { StatusGroup } from "~hooks/useLogs"
import type { FilterType } from "~types"

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterType: FilterType
  onFilterChange: (type: FilterType) => void
  statusGroup: StatusGroup
  onStatusGroupChange: (group: StatusGroup) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  statusGroup,
  onStatusGroupChange
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "12px"
      }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search path, method, or domain..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: "#18181b",
            border: "none",
            borderRadius: "6px",
            padding: "6px 12px",
            fontSize: "11px",
            color: "#f4f4f5",
            outline: "none"
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "2px",
            backgroundColor: "#18181b",
            padding: "2px",
            borderRadius: "6px"
          }}>
          {(["ALL", "ERRORS", "JWT"] as const).map((type) => (
            <button
              key={type}
              className={`tab-btn ${filterType === type ? "active" : ""}`}
              onClick={() => onFilterChange(type)}>
              {type}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            backgroundColor: showAdvanced ? "#27272a" : "#18181b",
            border: "none",
            borderRadius: "6px",
            padding: "6px",
            cursor: "pointer",
            fontSize: "11px",
            color: showAdvanced ? "#f4f4f5" : "#71717a",
            transition: "all 0.15s"
          }}
          title="Status Filter">
          ⚙️
        </button>
      </div>

      {showAdvanced && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "8px 12px",
            backgroundColor: "#131316",
            borderRadius: "8px",
            border: "1px solid #1c1c1f",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
          <span
            style={{ fontSize: "9px", color: "#71717a", fontWeight: "bold" }}>
            HTTP STATUS
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            {(["ALL", "2xx", "3xx", "4xx", "5xx"] as const).map((group) => (
              <button
                key={group}
                onClick={() => onStatusGroupChange(group)}
                style={{
                  backgroundColor:
                    statusGroup === group ? "#27272a" : "transparent",
                  border: "none",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "10px",
                  color: statusGroup === group ? "#f4f4f5" : "#71717a",
                  cursor: "pointer",
                  transition: "all 0.1s"
                }}>
                {group}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
