import { ApiError, ApiResponse } from "@/types"

export async function apiResponseTransform<T, K>(
  func: (k: K) => Promise<ApiResponse<T>>
) {
  const result = await func(arguments)
  if (result.error) {
    throw new ApiError(result.error.message, 400)
  }
  return { data: result.data, message: result.message }
}
