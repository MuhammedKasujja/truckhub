import { redirect } from "@tanstack/react-router"
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

// Dedupe concurrent refreshes (important as refresh tokens rotate)
let refreshing: Promise<TokenRefreshResponse> | null = null

const PUBLIC_PATHS = ["/v1/auth/login", "/v1/auth/refresh-token"]

const isPublic = (url?: string) =>
  !!url && PUBLIC_PATHS.some((p) => url.startsWith(p))

const apiOptions = {
  baseURL: `${process.env.BACKEND_URL}`,
  timeout: 15000, // ← prevents hanging forever after 15 secs
  headers: {
    "Content-Type": "application/json",
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
    if (session) config.headers.Authorization = `Bearer ${session.accessToken}`
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
        `Endpoint  ${error.config?.url} [ ${error.request.method} ] ${error.code} --> ${error.status}\n`
      )
      // logger.error(error)
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
      original.skipAuth // public endpoint: just pass the 401 through
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
      if (error.status === 404 && !(error.response?.data as any).error) {
        if (process.env.NODE_ENV === "development") {
          logger.error(
            `${error.request.method} ${error.request.path} 404 - NOT FOUND`
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

    const session = await getSession()
    if (!session) {
      throw redirect({ to: "/login" })
    }
    logger.info("Refreshing auth token")

    try {
      refreshing ??= authApi
        .post<TokenRefreshResponse>("/v1/auth/refresh", {
          refresh_token: session.refreshToken,
        })
        .then((r) => r.data)
        .finally(() => {
          refreshing = null
        })

      const tokens = await refreshing
      await updateSession({ data: tokens })
      original.headers.Authorization = `Bearer ${tokens.access_token}`
      return api(original) // retry once
    } catch {
      clearSession() // refresh failed, so log out
      throw redirect({ to: "/login" })
    }
  }
)

export { api }
