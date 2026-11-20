import { useEffect, useId, useState } from "react"
import { Ban, Loader2 } from "lucide-react"
import { useVoidDocument } from "../hooks/use-document-actions"
import type { DocumentOwner } from "../schemas"
import type { DocumentLink } from "../types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Props = {
  owner: DocumentOwner
  /** The document to withdraw; the dialog is closed while this is undefined. */
  link: DocumentLink | undefined
  onClose: () => void
}

const MIN_REASON = 3

/** Withdraw a document. The file stays on record with the reason. */
export function VoidDocumentDialog({ owner, link, onClose }: Props) {
  const reasonId = useId()
  const [reason, setReason] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { voidDocument, isPending } = useVoidDocument()

  const open = !!link

  useEffect(() => {
    if (!open) return
    setReason("")
    setSubmitted(false)
  }, [open, link?.id])

  if (!link) return null

  const tooShort = reason.trim().length < MIN_REASON
  const error = submitted && tooShort ? "Say why it is being withdrawn" : null

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    event.stopPropagation()
    setSubmitted(true)
    if (!link || tooShort) return

    try {
      await voidDocument({ ...owner, linkId: link.id, reason: reason.trim() })
      onClose()
    } catch {
      // The action hook has already shown the API's message
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPending) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>
              Void {link.document_type.name.toLowerCase()}?
            </DialogTitle>
            <DialogDescription>
              {link.original_filename} will no longer count as the current
              document. The file and this record are kept, and this cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor={reasonId}>Reason</Label>
            <Textarea
              id={reasonId}
              value={reason}
              maxLength={500}
              placeholder="e.g. Wrong file uploaded"
              aria-invalid={!!error}
              onChange={(event) => setReason(event.target.value)}
            />
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Ban />}
              Void document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
