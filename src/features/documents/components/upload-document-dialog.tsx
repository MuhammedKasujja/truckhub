import { useEffect, useId, useState } from "react"
import { format, parseISO } from "date-fns"
import { FileUp, Loader2, Upload } from "lucide-react"
import { contentTypesLabel, fileProblem, fileSizeLabel } from "../format"
import { useUploadDocument } from "../hooks/use-document-actions"
import type { DocumentOwner } from "../schemas"
import type { DocumentLink, DocumentType } from "../types"
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
import { DatePicker } from "@/components/ui/form-fields"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { PhoneCaptureButton } from "@/features/phone-capture"

type Props = {
  owner: DocumentOwner
  /** The type to upload; the dialog is closed while this is undefined. */
  documentType: DocumentType | undefined
  /** The version this upload replaces, if there is one. */
  current?: DocumentLink
  onClose: () => void
}

const todayIso = () => format(new Date(), "yyyy-MM-dd")

/** Upload a document, or a newer version of one. The old version is kept. */
export function UploadDocumentDialog({
  owner,
  documentType,
  current,
  onClose,
}: Props) {
  const fileInputId = useId()
  const expiryInputId = useId()
  const [file, setFile] = useState<File>()
  const [expiresOn, setExpiresOn] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const { uploadDocument, isPending } = useUploadDocument()

  const open = !!documentType

  useEffect(() => {
    if (!open) return
    setFile(undefined)
    setExpiresOn("")
    setSubmitted(false)
  }, [open, documentType?.id])

  if (!documentType) return null

  const fileError = file
    ? fileProblem(file, documentType)
    : submitted
      ? "Choose a file"
      : null
  const expiryError = !documentType.requires_expiry
    ? null
    : !expiresOn
      ? submitted
        ? "Enter the expiry date"
        : null
      : expiresOn < todayIso()
        ? "This date has already passed"
        : null

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    event.stopPropagation()
    setSubmitted(true)
    if (!documentType || !file) return
    if (fileProblem(file, documentType)) return
    if (
      documentType.requires_expiry &&
      (!expiresOn || expiresOn < todayIso())
    ) {
      return
    }

    try {
      await uploadDocument({
        ...owner,
        documentTypeCode: documentType.code,
        expiresOn: expiresOn || undefined,
        file,
      })
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
              {current ? "Replace" : "Upload"} {documentType.name.toLowerCase()}
            </DialogTitle>
            <DialogDescription>
              {current
                ? "The current file is kept in the history."
                : "Attach the file to this record."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <label
              htmlFor={fileInputId}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                const dropped = event.dataTransfer.files.item(0)
                if (dropped) setFile(dropped)
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center transition-colors hover:bg-muted/40",
                isDragging && "border-primary bg-primary/5",
                fileError && "border-destructive/50"
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FileUp className="size-5" />
              </span>
              {file ? (
                <>
                  <span className="max-w-full truncate text-sm font-medium">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {fileSizeLabel(file.size)} · Choose another file
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">
                    Choose a file or drop it here
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {contentTypesLabel(documentType.allowed_content_types)} · up
                    to {fileSizeLabel(documentType.max_size_bytes)}
                  </span>
                </>
              )}
            </label>
            <input
              id={fileInputId}
              type="file"
              className="sr-only"
              accept={documentType.allowed_content_types.join(",")}
              aria-invalid={!!fileError}
              onChange={(event) => setFile(event.target.files?.[0])}
            />
            <div className="flex justify-end">
              <PhoneCaptureButton
                accept={documentType.allowed_content_types.join(",")}
                onFile={setFile}
              />
            </div>
            {fileError && (
              <p role="alert" className="text-sm text-destructive">
                {fileError}
              </p>
            )}
          </div>

          {documentType.requires_expiry && (
            <div className="space-y-1.5">
              <Label htmlFor={expiryInputId}>Expiry date</Label>
              <DatePicker
                id={expiryInputId}
                value={expiresOn ? parseISO(expiresOn) : undefined}
                minDate={new Date()}
                endDate={new Date(2030, 11)}
                placeholder="Pick a date"
                aria-invalid={!!expiryError}
                format="P"
                onDateChanged={(date) =>
                  setExpiresOn(date ? format(date, "yyyy-MM-dd") : "")
                }
              />
              {expiryError && (
                <p role="alert" className="text-sm text-destructive">
                  {expiryError}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Upload />}
              {isPending ? "Uploading…" : current ? "Replace" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
