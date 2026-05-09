"use server"

import { api } from "@/lib/api"
import { AxiosError } from "axios"
import { logout } from "@/features/auth/service"
import type {
  Prettify,
  ApiResponse,
  ErrorStatusCode,
  ApiPaginatedResponse,
} from "@/types"

export async function getFn<T>(url: string): Promise<Prettify<ApiResponse<T>>> {
  try {
    const response = await api.get(url)
    return {
      isSuccess: true,
      data: response.data.data,
      message: response.data.message,
    }
  } catch (error) {
    return _handleApiException(error)
  }
}

export async function getPaginatedFn<T>(
  url: string
): Promise<Prettify<ApiPaginatedResponse<T>>> {
  try {
    const response = await api.get(url)
    return {
      isSuccess: true,
      data: response.data.data,
      message: response.data.message,
      pagination: response.data.meta,
    }
  } catch (error) {
    return _handleApiException(error)
  }
}

export async function postFn<T>(
  url: string,
  data: unknown
): Promise<ApiResponse<T>> {
  try {
    const response = await api.post(url, data)
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

export async function deleteFn(url: string): Promise<ApiResponse> {
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
  const statusCode = handleErrorCodes(error)
  return {
    isSuccess: false,
    error: {
      message: (error as any).response.data.error.message,
      code: (error as any).response.data.error.code,
      status: statusCode,
    },
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
  if (statusCode === "NOT_AUTHENTICATED") return logout()
}
