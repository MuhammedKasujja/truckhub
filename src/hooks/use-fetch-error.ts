import { toast } from "sonner"
import { useEffect } from "react"
import { ApiError, AppErrorDetails, Prettify } from "@/types"

/**
 * Toasts an api error. A 401 is skipped: the query/mutation caches in
 * `router.tsx` log the user out for it.
 * @param error AppErrorDetails
 */
export function useFetchEror(
  error?: Prettify<AppErrorDetails> | ApiError | null
) {
  useEffect(() => {
    if (error) {
      if (error.statusCode != 401) toast.error(error.message)
    }
  }, [error])
}
