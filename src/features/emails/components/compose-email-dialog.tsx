import { ComposeEmailForm } from "./compose-email-form"
import type { ComposeContext } from "../types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: ComposeContext
  title?: string
}

export function ComposeEmailDialog({
  open,
  onOpenChange,
  context,
  title = "New email",
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="gap-1 border-b px-6 pt-5 pb-4">
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription>
            Type @ to insert details from any record.
          </DialogDescription>
        </DialogHeader>
        {/* Remounted on open, so each email starts empty */}
        {open && (
          <ComposeEmailForm
            context={context}
            onSent={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
            className="min-h-0 flex-1"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
