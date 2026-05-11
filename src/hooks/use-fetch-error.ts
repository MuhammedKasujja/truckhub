import { toast } from "sonner";
import React, { startTransition } from "react";
import { logoutFn } from "@/features/auth/services";
import { AppErrorDetails, Prettify } from "@/types";

/**
 * Automatically logs out user on `NOT_AUTHENTICATED` api status error
 * @param error AppErrorDetails
 */
export function useFetchEror(error?: Prettify<AppErrorDetails> | null) {
  React.useEffect(() => {
    if (error) {
      if (error.status === "NOT_AUTHENTICATED") {
        startTransition(async () => {
          await logoutFn();
        });
      } else {
        toast.error(error.message);
      }
    }
  }, [error]);
}
