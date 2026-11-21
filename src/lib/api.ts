import { jsonFormatter, logger } from "@/lib/logger"
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import {
  getSession,
  clearSession,
  updateSession,
} from "@/features/auth/services"
import { TokenRefreshResponse } from "@/features/auth/types"

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuth?: boolean
  }
}

type Retriable = InternalAxiosRequestConfig & { _retry?: boolean }

type RefreshEnvelope = { data: TokenRefreshResponse } | TokenRefreshResponse

// In-flight refreshes, keyed by refresh token. Keying by token keeps users
// apart: on a long-running server every user shares this module, and one
// user must never await (and save) another user's tokens.
const refreshing = new Map<string, Promise<TokenRefreshResponse>>()

const PUBLIC_PATHS = ["/v1/auth/login", "/v1/auth/refresh"]

const isPublic = (url?: string) =>
  !!url && PUBLIC_PATHS.some((p) => url.startsWith(p))

// 401s that could not be recovered by a token refresh: the session is dead
const expiredSessionErrors = new WeakSet<object>()

/** True when the request failed with a 401 and the token refresh failed too. */
export const isSessionExpired = (error: unknown) =>
  typeof error === "object" && error !== null && expiredSessionErrors.has(error)

/**
 * True when the backend rejected the refresh token itself. Every rejection
 * (not found, revoked, expired, reused, user inactive) comes back as 401.
 * Any other failure (timeout, network, 4xx/5xx) says nothing about the
 * session, so callers must not log the user out for it.
 */
export const isRefreshRejected = (error: unknown) =>
  (error as AxiosError | undefined)?.response?.status === 401

const apiOptions = {
  baseURL: `${process.env.BACKEND_URL}`,
  timeout: 15000, // ← prevents hanging forever after 15 secs
  headers: {
    Accept: "application/json",
  },
}

const api = axios.create({ ...apiOptions })

const authApi = axios.create({ ...apiOptions }) // no interceptors, avoids loops

api.interceptors.request.use(async (config: Retriable) => {
  if (process.env.NODE_ENV === "development") {
    logger.info(`Request data **************`)
    if (config.data) logger.debug(jsonFormatter(config.data))
  }
  if (isPublic(config.url)) return config

  // Skip adding token to login / refresh endpoints
  // const noAuthEndpoints = ["/login", "/refresh-token"];

  // Don't overwrite on retry. The new cookie isn't readable from the incoming request yet.
  if (!config.headers.Authorization) {
    const session = await getSession()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      logger.info(`Api ************** ${response.config.url}`)
      logger.debug(jsonFormatter(response.data))
    }
    return response
  },
  async (error: AxiosError) => {
    // Log the error in development
    if (process.env.NODE_ENV === "development") {
      logger.info(
        `Endpoint  ${error.config?.url} [ ${error.request?.method} ] ${error.code} --> ${error.status}\n`
      )
      logger.error(
        jsonFormatter({
          ErrorCode: error.code,
          Response: error.response?.data,
          Status: error.response?.status,
        })
      )
    }

    const original = error.config as Retriable | undefined

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      original.skipAuth || // public endpoint: just pass the 401 through
      isPublic(original.url)
    ) {
      if (error.code === "ECONNABORTED") {
        return Promise.reject({
          ...error,
          response: {
            data: {
              status: 503,
              success: false,
              error: {
                code: "CONNECTION_TIMEOUT",
                message: "Connection timedout. Please try again",
              },
            },
          },
        })
      }
      if (
        error.code === "ECONNREFUSED" ||
        error.code === "ECONNRESET" ||
        error.message.includes("Network Error")
      ) {
        return Promise.reject({
          ...error,
          response: {
            data: {
              status: 503,
              success: false,
              error: {
                code: "SERVICE_UNAVAILABLE",
                message: "Could not connect to server",
              },
            },
          },
        })
      }
      // This handles when the API endpoint is Not Found
      if (error.status === 404 && !(error.response?.data as any)?.error) {
        if (process.env.NODE_ENV === "development") {
          logger.error(
            `${error.request?.method} ${error.request.path} 404 - NOT FOUND`
          )
        }
        return Promise.reject({
          ...error,
          response: {
            data: {
              status: 404,
              success: false,
              error: {
                code: "NOT_FOUND",
                message: "Api Endpoint not available",
              },
            },
          },
        })
      }
      return Promise.reject(error)
    }

    original._retry = true

    // Reject with the original 401, marked as a dead session. The api-client
    // wrappers turn that into the redirect to /login.
    const session = await getSession()
    if (!session?.refreshToken) {
      expiredSessionErrors.add(error)
      return Promise.reject(error)
    }
    logger.info("Refreshing auth token")

    try {
      const tokens = await refreshTokens(session.refreshToken)
      await updateSession({ data: tokens })
      original.headers.Authorization = `Bearer ${tokens.access_token}`
    } catch (refreshError) {
      logger.error(`Token refresh failed: ${(refreshError as Error)?.message}`)
      // A timeout or backend blip says nothing about the session: keep it and
      // fail just this request. Only a rejected refresh token logs out.
      if (!isRefreshRejected(refreshError)) return Promise.reject(error)
      await clearSession()
      expiredSessionErrors.add(error)
      return Promise.reject(error)
    }

    return api(original) // retry once
  }
)

/**
 * Exchange a refresh token for a new pair. Parallel calls with the same token
 * share one request, since the backend rotates the token on each use.
 */
export function refreshTokens(
  refreshToken: string
): Promise<TokenRefreshResponse> {
  let pending = refreshing.get(refreshToken)
  if (!pending) {
    pending = authApi
      .post<RefreshEnvelope>("/v1/auth/refresh", {
        refresh_token: refreshToken,
      })
      // The backend wraps payloads as `{ data, message }`
      .then((r) => ("data" in r.data ? r.data.data : r.data))
      .finally(() => {
        refreshing.delete(refreshToken)
      })
    refreshing.set(refreshToken, pending)
  }
  return pending
}

export { api }
