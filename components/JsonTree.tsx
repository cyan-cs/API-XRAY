import React, { useState } from "react"

interface JsonTreeProps {
  data: unknown
  label?: string
  isLast?: boolean
  depth?: number
}

export const JsonTree: React.FC<JsonTreeProps> = ({
  data,
  label,
  isLast = true,
  depth = 0
}) => {
  const [isOpen, setIsOpen] = useState(depth < 2)

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  const renderValue = (val: unknown) => {
    if (val === null) return <span style={{ color: "#ff7b72" }}>null</span>
    if (typeof val === "boolean")
      return <span style={{ color: "#79c0ff" }}>{String(val)}</span>
    if (typeof val === "number")
      return <span style={{ color: "#d2a8ff" }}>{val}</span>
    if (typeof val === "string")
      return <span style={{ color: "#a5d6ff" }}>&quot;{val}&quot;</span>
    return <span>{String(val)}</span>
  }

  if (data !== null && typeof data === "object") {
    const isArray = Array.isArray(data)
    const keys = Object.keys(data as object)
    const values = data as Record<string, unknown>
    const isEmpty = keys.length === 0
    const opener = isArray ? "[" : "{"
    const closer = isArray ? "]" : "}"

    if (isEmpty) {
      return (
        <div style={{ marginLeft: depth > 0 ? "16px" : "0" }}>
          {label && (
            <span style={{ color: "#79c0ff", marginRight: "4px" }}>
              {label}:
            </span>
          )}
          <span style={{ color: "#8b949e" }}>
            {opener}
            {closer}
            {isLast ? "" : ","}
          </span>
        </div>
      )
    }

    return (
      <div
        style={{
          marginLeft: depth > 0 ? "16px" : "0",
          fontFamily: "monospace",
          fontSize: "11px"
        }}>
        <div
          onClick={toggle}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            userSelect: "none"
          }}>
          <span
            style={{
              display: "inline-block",
              width: "12px",
              transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.1s",
              color: "#8b949e",
              fontSize: "8px",
              marginRight: "2px"
            }}>
            ▶
          </span>
          {label && (
            <span style={{ color: "#79c0ff", marginRight: "4px" }}>
              {label}:
            </span>
          )}
          <span style={{ color: "#8b949e" }}>{opener}</span>
          {!isOpen && (
            <span
              style={{
                backgroundColor: "#21262d",
                padding: "0 4px",
                borderRadius: "3px",
                margin: "0 4px",
                fontSize: "10px",
                color: "#8b949e"
              }}>
              {keys.length} items
            </span>
          )}
          {!isOpen && (
            <span style={{ color: "#8b949e" }}>
              {closer}
              {isLast ? "" : ","}
            </span>
          )}
        </div>

        {isOpen && (
          <div style={{ borderLeft: "1px solid #30363d", marginLeft: "5px" }}>
            {keys.map((key, i) => (
              <JsonTree
                key={key}
                label={isArray ? undefined : `"${key}"`}
                data={values[key]}
                isLast={i === keys.length - 1}
                depth={depth + 1}
              />
            ))}
          </div>
        )}

        {isOpen && (
          <div style={{ color: "#8b949e", marginLeft: "14px" }}>
            {closer}
            {isLast ? "" : ","}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        marginLeft: depth > 0 ? "16px" : "0",
        fontFamily: "monospace",
        fontSize: "11px"
      }}>
      {label && (
        <span style={{ color: "#79c0ff", marginRight: "4px" }}>{label}:</span>
      )}
      {renderValue(data)}
      {!isLast && <span style={{ color: "#8b949e" }}>,</span>}
    </div>
  )
}
