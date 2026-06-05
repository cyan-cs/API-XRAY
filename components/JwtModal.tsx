import React from "react"

import type { DecodedJwt } from "~types"
import { extractPermissions, getExpirationInfo } from "~utils/helpers"

interface JwtModalProps {
  jwtDetails: DecodedJwt
  isCopied: boolean
  onClose: () => void
  onCopy: (text: string, type: string) => void
}

export const JwtModal: React.FC<JwtModalProps> = ({
  jwtDetails,
  isCopied,
  onClose,
  onCopy
}) => {
  const stringify = (obj: unknown) => {
    try {
      return JSON.stringify(
        obj,
        (_, value) => (typeof value === "bigint" ? value.toString() : value),
        2
      )
    } catch {
      return "Error: Could not stringify payload"
    }
  }

  if (!jwtDetails || !jwtDetails.payload) {
    return null
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(9, 9, 11, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}>
      <div
        style={{
          backgroundColor: "#18181b",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.5)"
        }}>
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px",
            backgroundColor: "#1c1c1f"
          }}>
          <h4
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}>
            🔑 JWT Decoder
          </h4>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "#a1a1aa",
              fontSize: "16px",
              cursor: "pointer",
              padding: "4px"
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
            gap: "14px"
          }}>
          {(() => {
            const expInfo = getExpirationInfo(jwtDetails.payload)
            return (
              <div
                style={{
                  backgroundColor: "#09090b",
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: expInfo.color,
                      display: "inline-block"
                    }}
                  />
                  <span
                    style={{
                      fontSize: "10px",
                      color: expInfo.color,
                      fontWeight: "bold",
                      textTransform: "uppercase"
                    }}>
                    {expInfo.status}
                  </span>
                </div>
                <span style={{ fontSize: "11px", color: "#e4e4e7" }}>
                  {expInfo.text}
                </span>
              </div>
            )
          })()}

          {(() => {
            const perms = extractPermissions(jwtDetails.payload)
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}>
                <span
                  style={{
                    fontSize: "10px",
                    color: "#71717a",
                    fontWeight: "bold"
                  }}>
                  PERMISSIONS & SCOPES
                </span>
                {perms.length === 0 ? (
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#a1a1aa",
                      fontStyle: "italic",
                      backgroundColor: "#09090b",
                      padding: "8px",
                      borderRadius: "6px"
                    }}>
                    No scopes or roles detected in token payload.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px",
                      backgroundColor: "#09090b",
                      padding: "8px",
                      borderRadius: "6px"
                    }}>
                    {perms.map((p, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: "rgba(99, 102, 241, 0.15)",
                          color: "#a5b4fc",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "9.5px",
                          fontWeight: "500"
                        }}>
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span
              style={{
                fontSize: "10px",
                color: "#71717a",
                fontWeight: "bold"
              }}>
              DECODED PAYLOAD
            </span>
            <pre
              style={{
                margin: 0,
                backgroundColor: "#09090b",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "10px",
                color: "#a1a1aa",
                maxHeight: "200px",
                overflowY: "auto",
                fontFamily: "monospace",
                lineHeight: "1.4"
              }}>
              {stringify(jwtDetails.payload)}
            </pre>
          </div>
        </div>

        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: "#1c1c1f"
          }}>
          <button
            className="clear-btn"
            onClick={() => onCopy(jwtDetails.token, "JWTトークン")}
            style={{
              marginRight: "8px"
            }}>
            {isCopied ? "Copied! ✓" : "📋 Copy Token"}
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "#6366f1",
              border: "none",
              color: "white",
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "bold",
              cursor: "pointer"
            }}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
