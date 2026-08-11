import { ApiError, ApiResponse } from "@/types"

// export async function apiResponseTransform<T, K>(
//   func: (k: K) => Promise<ApiResponse<T>>
// ) {
//   const result = await func(arguments)
//   if (result.error) {
//     throw new ApiError(result.error.message, 400)
//   }
//   return { data: result.data, message: result.message }
// }

export async function apiResponseTransform<T>(
  apiCall: Promise<ApiResponse<T>>
): Promise<{ data?: T; message?: string | null }> {
  const result = await apiCall

  if (result.error) {
    throw new ApiError(result.error.message, 400)
  }

  return { data: result.data, message: result.message }
}

export async function apiResponseEntity<T>(
  apiCall: Promise<ApiResponse<T>>
): Promise<T | undefined> {
  const result = await apiCall

  if (result.error) {
    throw new ApiError(result.error.message, 400)
  }

  return result.data
}

// Example usage
// const result = await handleApiCall(changeClientType(data.id))
