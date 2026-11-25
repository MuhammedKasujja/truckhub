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

export function ComposeEmailDialog({ open, onOpenChange, context, title = "Compose email" }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Type @ to insert an invoice, quotation, trip, client, driver, vehicle or user, then pick one of its values.
          </DialogDescription>
        </DialogHeader>
        {/* Remounted on open, so each email starts empty */}
        {open && (
          <ComposeEmailForm
            context={context}
            onSent={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
