import { api, isSessionExpired } from "@/lib/api"
import { redirect } from "@tanstack/react-router"
import { AxiosError, RawAxiosRequestHeaders } from "axios"
import type {
  Prettify,
  StatusCode,
  ApiResponse,
  ErrorStatusCode,
  ApiPaginatedResponse,
} from "@/types"
import { logger } from "@/lib/logger"

export async function getFn<T>(url: string): Promise<Prettify<ApiResponse<T>>> {
  try {
    const response = await api.get(url)
    return {
      isSuccess: true,
      data: response.data?.data,
      message: response.data?.message,
    }
  } catch (error) {
    await logoutOnServerActions(error)
    return _handleApiException(error)
  }
}

export async function getPaginatedFn<T>(
  url: string
): Promise<Prettify<ApiPaginatedResponse<T>>> {
  try {
    const response = await api.get(url)
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      pagination: response.data.meta,
    }
  } catch (error) {
    await logoutOnServerActions(error)
    const errorCode = handleErrorCodes(error)
    const statusCode = (
      error instanceof AxiosError ? error.status : 400
    ) as StatusCode
    const body = errorBody(error)
    return {
      success: false,
      error: {
        message: body.message,
        code: body.code,
        statusCode: statusCode,
        erroCode: errorCode,
      },
    }
  }
}

type Headers = { headers?: RawAxiosRequestHeaders }

export async function postFn<T>(
  url: string,
  data: unknown,
  config?: Headers
): Promise<ApiResponse<T>> {
  try {
    const response = await api.post(
      url,
      data,
      config?.headers ? { headers: config?.headers } : undefined
    )
    return {
      isSuccess: true,
      data: response.data.data,
      message: response.data.message,
    }
  } catch (error) {
    await logoutOnServerActions(error)
    return _handleApiException(error)
  }
}

export async function putFn<T>(
  url: string,
  data: unknown = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await api.put(url, data)
    return {
      isSuccess: true,
      data: response.data.data,
      message: response.data.message,
    }
  } catch (error) {
    await logoutOnServerActions(error)
    return _handleApiException(error)
  }
}

export async function patchFn<T>(
  url: string,
  data: unknown = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await api.patch(url, data)
    return {
      isSuccess: true,
      data: response.data.data,
      message: response.data.message,
    }
  } catch (error) {
    await logoutOnServerActions(error)
    return _handleApiException(error)
  }
}

export async function deleteFn<T = null>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await api.delete(url)
    return {
      isSuccess: true,
      data: response.data.data,
      message: response.data.message,
    }
  } catch (error) {
    await logoutOnServerActions(error)
    return _handleApiException(error)
  }
}

function _handleApiException<T>(error: unknown): ApiResponse<T> {
  const statusMessage = handleErrorCodes(error)
  const errorCode = (
    error instanceof AxiosError ? error.status : 400
  ) as StatusCode
  const body = errorBody(error)
  return {
    isSuccess: false,
    error: {
      message: body.message,
      code: body.code,
      status: statusMessage,
      statusCode: errorCode,
      details: body.details,
    },
  }
}

/** Reads the backend error payload; safe for errors with no `response`. */
function errorBody(error: unknown) {
  const body = (error as any)?.response?.data?.error
  return {
    message: body?.message ?? (error as any)?.message ?? "Something went wrong",
    code: body?.code,
    details: body?.details,
  }
}

function handleErrorCodes(error: unknown): ErrorStatusCode | undefined {
  if (error instanceof AxiosError) {
    if (error.status == 401) return "NOT_AUTHENTICATED"
    if (error.status == 403) return "NOT_AUTHORIZED"
  }
  return
}

async function logoutOnServerActions(error: unknown) {
  const statusCode = handleErrorCodes(error)
  logger.info(
    `API Error with status code ${statusCode} and message: ${(error as any)?.message}`
  )
  // The token refresh failed too: the session is already cleared, so send
  // the user to login right away. Loaders and the query cache handle this.
  // Any other 401 (e.g. the refresh timed out) keeps the session and comes
  // back as a normal error envelope.
  if (isSessionExpired(error)) {
    throw redirect({ to: "/login", replace: true })
  }
}
