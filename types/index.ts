export interface RequestLog {
  requestId: string
  method: string
  url: string
  timeStamp: number
  status?: number
  type: string
  requestHeaders?: chrome.webRequest.HttpHeader[]
  responseHeaders?: chrome.webRequest.HttpHeader[]
  responseBody?: unknown
  requestBody?: unknown
  tabId?: number
  isReplay?: boolean
}

export interface DecodedJwt {
  header: unknown
  payload: unknown
  token: string
}

export type FilterType = "ALL" | "ERRORS" | "JWT"
