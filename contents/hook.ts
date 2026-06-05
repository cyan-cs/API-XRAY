import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  world: "MAIN"
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"]

function generateRequestId(): string {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

function parseJson(value: unknown) {
  if (typeof value !== "string") return value

  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

function isTargetType(contentType: string) {
  return (
    contentType.includes("application/json") ||
    contentType.includes("application/x-www-form-urlencoded")
  )
}

const originalFetch = window.fetch
window.fetch = async (...args) => {
  const response = await originalFetch(...args)
  const clone = response.clone()

  const contentType = response.headers.get("content-type")?.toLowerCase() || ""

  // Extract method from either options object (args[1]) or Request object (args[0])
  let method = "GET"
  if (args[1]?.method) {
    method = args[1].method.toUpperCase()
  } else if (args[0] instanceof Request) {
    method = args[0].method.toUpperCase()
  }

  if (METHODS.includes(method)) {
    try {
      let body: unknown = null
      if (contentType.includes("application/json")) {
        body = await clone.json()
      }

      let reqBody: unknown = undefined

      // Extract request body from options object (args[1]) or Request object (args[0])
      let requestBodySource: unknown = undefined
      if (args[1]?.body !== undefined) {
        requestBodySource = args[1].body
      } else if (args[0] instanceof Request && args[0].body) {
        try {
          requestBodySource = await args[0].clone().text()
        } catch {
          requestBodySource = undefined
        }
      }

      if (requestBodySource !== undefined) {
        reqBody = parseJson(requestBodySource)
      }

      if ((body && typeof body === "object") || isTargetType(contentType)) {
        window.postMessage(
          {
            type: "API_XRAY_CAPTURED",
            payload: {
              requestId: generateRequestId(),
              url: response.url,
              method,
              status: response.status,
              timeStamp: Date.now(),
              responseBody: body || { _raw: "Non-JSON response captured" },
              requestBody: reqBody,
              type: "fetch"
            }
          },
          "*"
        )
      }
    } catch {
      return response
    }
  }

  return response
}

interface ExtendedXHR extends XMLHttpRequest {
  _method?: string
  _url?: string | URL
  _requestBody?: unknown
}

type XhrOpenArgs =
  | [method: string, url: string | URL]
  | [
      method: string,
      url: string | URL,
      async: boolean,
      username?: string | null,
      password?: string | null
    ]
type XhrSendArgs = [] | [body?: Document | XMLHttpRequestBodyInit | null]

const XHR = XMLHttpRequest.prototype as ExtendedXHR
const originalOpen = XHR.open
const originalSend = XHR.send

XHR.open = function (this: ExtendedXHR, ...args: XhrOpenArgs) {
  this._method = String(args[0]).toUpperCase()
  this._url = args[1]
  if (args.length === 2) {
    return originalOpen.call(this, args[0], args[1])
  }
  return originalOpen.call(this, args[0], args[1], args[2], args[3], args[4])
} as XMLHttpRequest["open"]

XHR.send = function (this: ExtendedXHR, ...args: XhrSendArgs) {
  this._requestBody = args[0]
  this.addEventListener("load", function (this: ExtendedXHR) {
    const contentType = (
      this.getResponseHeader("content-type") || ""
    ).toLowerCase()

    if (this._method && METHODS.includes(this._method)) {
      try {
        let body: unknown = null
        if (contentType.includes("application/json")) {
          body = JSON.parse(this.responseText)
        }

        let reqBody: unknown = undefined
        if (this._requestBody !== undefined && this._requestBody !== null) {
          reqBody = parseJson(this._requestBody)
        }

        if ((body && typeof body === "object") || isTargetType(contentType)) {
          const url = String(this._url)

          window.postMessage(
            {
              type: "API_XRAY_CAPTURED",
              payload: {
                requestId: generateRequestId(),
                url: url.startsWith("http")
                  ? url
                  : window.location.origin + url,
                method: this._method,
                status: this.status,
                timeStamp: Date.now(),
                responseBody: body || { _raw: "Non-JSON response captured" },
                requestBody: reqBody,
                type: "xmlhttprequest"
              }
            },
            "*"
          )
        }
      } catch {
        return
      }
    }
  })

  return originalSend.apply(this, args)
} as XMLHttpRequest["send"]
