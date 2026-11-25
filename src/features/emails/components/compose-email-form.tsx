import { useMemo, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AtSign, Eye, FileText, Paperclip, ReceiptText, X } from "lucide-react"
import { createEntityMention, refreshMentions } from "../mentions/entity-mention"
import { useComposeEmail, usePreviewComposedEmail } from "../hooks/use-compose-email"
import { ComposeEmailSchema } from "../schemas"
import { EmailChipsInput } from "./email-chips-input"
import { EmailInput } from "./email-input"
import type { ComposeAttachment } from "../schemas"
import type { ComposeContext } from "../types"
import type { Editor } from "@tiptap/react"
import { EmailBodyEditor } from "@/components/editor/email-body-editor"
import { EmailPreviewDialog } from "@/features/settings/email-templates/components/email-preview-dialog"
import { invoiceDetailsQueryOptions } from "@/features/invoices/query-options"
import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { shipmentsDetailsQueryOptions } from "@/features/shipments/query-options"
import { clientProfileQueryOptions } from "@/features/clients/query-options"
import { InvoicePicker } from "@/features/invoices/components/invoice-picker"
import { QuotationPicker } from "@/features/quotations/components/quotation-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SubmitButton } from "@/components/ui/submit-button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type Attached = ComposeAttachment & { label: string }

type Props = {
  context?: ComposeContext
  onSent?: () => void
  onCancel?: () => void
  className?: string
}

/** Where the mention popup is mounted, so it stays clickable inside a modal dialog. */
const POPUP_CONTAINER = "[data-email-composer]"

/**
 * Write an email, insert values from records with `@` (worked out here, in the
 * browser), attach invoice/quotation PDFs, and send.
 */
export function ComposeEmailForm({ context = {}, onSent, onCancel, className }: Props) {
  const queryClient = useQueryClient()
  const editorRef = useRef<Editor | null>(null)
  const { sendEmail, isPending } = useComposeEmail()
  const preview = usePreviewComposedEmail()
  const [previewOpen, setPreviewOpen] = useState(false)

  // Records the composer was opened from: recipient suggestions and attachments
  const invoice = useQuery({
    ...invoiceDetailsQueryOptions(context.invoiceId!),
    enabled: !!context.invoiceId,
  }).data?.data
  const quotation = useQuery({
    ...quotationDetailsQueryOptions(context.quotationId!),
    enabled: !!context.quotationId,
  }).data?.data
  const trip = useQuery({
    ...shipmentsDetailsQueryOptions(context.tripId!),
    enabled: !!context.tripId,
  }).data
  const clientId = context.clientId ?? invoice?.client.id ?? quotation?.client.id
  const client = useQuery({
    ...clientProfileQueryOptions(clientId!),
    enabled: !!clientId,
  }).data?.data

  const suggestions = useMemo(() => {
    const emails = [
      quotation?.contact?.email,
      quotation?.client.email,
      client?.email,
      ...(client?.contacts ?? []).map((c) => c.email),
      trip?.driver?.email,
    ]
    return [...new Set(emails.filter((e): e is string => !!e))]
  }, [quotation, client, trip])

  const [to, setTo] = useState("")
  const [cc, setCc] = useState<string[]>([])
  const [bcc, setBcc] = useState<string[]>([])
  const [showCopies, setShowCopies] = useState(false)
  const [subject, setSubject] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // The context's invoice/quotation is attached until removed
  const [extra, setExtra] = useState<Attached[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const attachments: Attached[] = useMemo(() => {
    const fromContext: Attached[] = []
    if (context.invoiceId)
      fromContext.push({ type: "invoice", id: context.invoiceId, label: invoice?.number ?? "Invoice" })
    if (context.quotationId)
      fromContext.push({ type: "quotation", id: context.quotationId, label: quotation?.number ?? "Quotation" })
    const all = [...fromContext, ...extra]
    return all.filter(
      (a, i) => !removed.includes(`${a.type}:${a.id}`) && all.findIndex((b) => b.type === a.type && b.id === a.id) === i
    )
  }, [context.invoiceId, context.quotationId, invoice, quotation, extra, removed])

  const mention = useMemo(
    () => createEntityMention({ queryClient, container: POPUP_CONTAINER }),
    [queryClient]
  )
  const extensions = useMemo(() => [mention], [mention])

  function attach(item: Attached) {
    setRemoved((r) => r.filter((key) => key !== `${item.type}:${item.id}`))
    setExtra((list) => [...list, item])
  }

  async function currentBody(): Promise<string> {
    const editor = editorRef.current
    if (!editor || editor.isEmpty) return ""
    await refreshMentions(editor, queryClient) // current values, not the ones from when the chip was added
    return editor.getHTML()
  }

  async function openPreview() {
    const body_html = await currentBody()
    if (!body_html) return setErrors({ body_html: "Write the email" })
    setPreviewOpen(true)
    preview.mutate({ subject: subject.trim() || "(no subject)", body_html })
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    const parsed = ComposeEmailSchema.safeParse({
      to: to.trim(),
      cc,
      bcc,
      subject,
      body_html: await currentBody(),
      attachments: attachments.map(({ type, id }) => ({ type, id })),
    })
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])))
      return
    }
    setErrors({})
    try {
      await sendEmail(parsed.data)
      onSent?.()
    } catch {
      // The hook shows the error; keep what was written so it can be sent again
    }
  }

  return (
    <form onSubmit={onSubmit} data-email-composer className={cn("relative flex flex-col gap-4", className)}>
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="compose-to">To</Label>
          {!showCopies && (
            <button type="button" className="text-muted-foreground text-xs hover:underline" onClick={() => setShowCopies(true)}>
              Cc / Bcc
            </button>
          )}
        </div>
        <EmailInput
          id="compose-to"
          value={to}
          onChange={setTo}
          suggestions={suggestions}
          placeholder="name@example.com"
          invalid={!!errors.to}
        />
        {errors.to && <p className="text-destructive text-xs">{errors.to}</p>}
      </div>

      {showCopies && (
        <div className="grid gap-4 sm:grid-cols-2">
          <EmailChipsInput id="compose-cc" label="Cc" value={cc} onChange={setCc} suggestions={suggestions} error={errors.cc} />
          <EmailChipsInput id="compose-bcc" label="Bcc" value={bcc} onChange={setBcc} suggestions={suggestions} error={errors.bcc} />
        </div>
      )}

      <div className="grid gap-1.5">
        <Label htmlFor="compose-subject">Subject</Label>
        <Input
          id="compose-subject"
          value={subject}
          maxLength={255}
          onChange={(e) => setSubject(e.target.value)}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && <p className="text-destructive text-xs">{errors.subject}</p>}
      </div>

      <div className="grid gap-1.5">
        <div className="flex items-center justify-between">
          <Label>Message</Label>
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <AtSign className="size-3" /> Type @ to insert an invoice, trip, client… or one of its values
          </span>
        </div>
        <EmailBodyEditor
          content=""
          extensions={extensions}
          onReady={(editor) => (editorRef.current = editor)}
          onChange={() => errors.body_html && setErrors(({ body_html: _, ...rest }) => rest)}
          placeholder="Write the email… type @ to insert a record"
          className={cn(errors.body_html && "border-destructive")}
        />
        {errors.body_html && <p className="text-destructive text-xs">{errors.body_html}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {attachments.map((a) => {
          const Icon = a.type === "invoice" ? ReceiptText : FileText
          return (
            <Badge key={`${a.type}:${a.id}`} variant="secondary" className="gap-1.5 py-1 pr-1">
              <Icon className="size-3.5" />
              {a.label}.pdf
              <button
                type="button"
                aria-label={`Remove ${a.label}`}
                className="hover:bg-muted rounded-sm p-0.5"
                onClick={() => setRemoved((r) => [...r, `${a.type}:${a.id}`])}
              >
                <X className="size-3" />
              </button>
            </Badge>
          )
        })}
        <AttachMenu onAttach={attach} disabled={attachments.length >= 5} />
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="button" variant="outline" onClick={openPreview}>
          <Eye className="size-4" /> Preview
        </Button>
        <SubmitButton text="Send" loadingText="Sending…" isSubmitting={isPending} />
      </div>

      <EmailPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        email={preview.data?.data}
        isLoading={preview.isPending}
      />
    </form>
  )
}

function AttachMenu({ onAttach, disabled }: { onAttach: (item: Attached) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="sm" disabled={disabled}>
          <Paperclip className="size-4" /> Attach PDF
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="grid w-80 gap-3">
        <div className="grid gap-1.5">
          <Label>Invoice</Label>
          <InvoicePicker
            value={null}
            allowCreate={false}
            onChange={(inv) => {
              if (!inv) return
              onAttach({ type: "invoice", id: inv.id, label: inv.number })
              setOpen(false)
            }}
          />
        </div>
        <div className="grid gap-1.5">
          <Label>Quotation</Label>
          <QuotationPicker
            value={null}
            allowCreate={false}
            onChange={(q) => {
              if (!q) return
              onAttach({ type: "quotation", id: q.id, label: q.number })
              setOpen(false)
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
