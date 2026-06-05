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
  header: Record<string, unknown>
  payload: Record<string, unknown>
  token: string
  error?: string
}

export type FilterType = "ALL" | "ERRORS" | "JWT"
