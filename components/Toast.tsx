import React from "react"

interface ToastProps {
  message: string
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#1c1c1f",
        color: "#10b981",
        padding: "8px 16px",
        borderRadius: "8px",
        fontSize: "11px",
        fontWeight: "500",
        boxShadow:
          "0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -2px rgba(0,0,0,0.5)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        animation: "fadeInUp 0.2s ease"
      }}>
      <span style={{ fontSize: "12px" }}>✅</span>
      <span>{message}</span>
    </div>
  )
}
