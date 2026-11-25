import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { composeEmailFn, previewComposedEmailFn } from "../services"
import type { ComposeEmailInput, ComposePreviewInput } from "../schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"

const useComposeEmailBase = createEntityActionHook(
  composeEmailFn,
  (invalidator, input: { data: ComposeEmailInput }) => {
    // Attached records get a "sent" activity and a higher send count
    for (const a of input.data.attachments ?? []) {
      if (a.type === "invoice") {
        invalidator.invoices.list.invalidate()
        invalidator.invoices.details(a.id)
      } else {
        invalidator.quotations.list.invalidate()
        invalidator.quotations.details(a.id)
      }
    }
  }
)

export function useComposeEmail() {
  const { isPending, execute } = useComposeEmailBase()
  return {
    isPending,
    sendEmail: (data: ComposeEmailInput) => execute({ data }),
  }
}

export function usePreviewComposedEmail() {
  return useMutation({
    mutationFn: (data: ComposePreviewInput) => previewComposedEmailFn({ data }),
    onError: (error) => toast.error(error.message || "Couldn't render the preview"),
  })
}
