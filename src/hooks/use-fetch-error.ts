import { toast } from "sonner"
import { startTransition, useEffect } from "react"
import { logoutFn } from "@/features/auth/services"
import { ApiError, AppErrorDetails, Prettify } from "@/types"

/**
 * Automatically logs out user on `NOT_AUTHENTICATED` api status error
 * @param error AppErrorDetails
 */
export function useFetchEror(
  error?: Prettify<AppErrorDetails> | ApiError | null
) {
  useEffect(() => {
    if (error) {
      if (error.statusCode === 401) {
        startTransition(async () => {
          await logoutFn()
        })
      } else {
        toast.error(error.message)
      }
    }
  }, [error])
}
