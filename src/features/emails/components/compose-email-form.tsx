import { useMemo, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  AtSign,
  Eye,
  FileText,
  Loader2,
  Paperclip,
  ReceiptText,
  Send,
  X,
} from "lucide-react"
import {
  createEntityMention,
  refreshMentions,
} from "../mentions/entity-mention"
import {
  useComposeEmail,
  usePreviewComposedEmail,
} from "../hooks/use-compose-email"
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
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RichTextEditor } from "@/components/editor/rte-text-editor"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

const MAX_ATTACHMENTS = 5

const MOD_KEY =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
    ? "⌘"
    : "Ctrl"

/**
 * Write an email, insert values from records with `@` (worked out here, in the
 * browser), attach invoice/quotation PDFs, and send.
 */
export function ComposeEmailForm({
  context = {},
  onSent,
  onCancel,
  className,
}: Props) {
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
  const clientId =
    context.clientId ?? invoice?.client.id ?? quotation?.client.id
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
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [subject, setSubject] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // The context's invoice/quotation is attached until removed
  const [extra, setExtra] = useState<Attached[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const attachments: Attached[] = useMemo(() => {
    const fromContext: Attached[] = []
    if (context.invoiceId)
      fromContext.push({
        type: "invoice",
        id: context.invoiceId,
        label: invoice?.number ?? "Invoice",
      })
    if (context.quotationId)
      fromContext.push({
        type: "quotation",
        id: context.quotationId,
        label: quotation?.number ?? "Quotation",
      })
    const all = [...fromContext, ...extra]
    return all.filter(
      (a, i) =>
        !removed.includes(`${a.type}:${a.id}`) &&
        all.findIndex((b) => b.type === a.type && b.id === a.id) === i
    )
  }, [
    context.invoiceId,
    context.quotationId,
    invoice,
    quotation,
    extra,
    removed,
  ])

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
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((i) => [String(i.path[0]), i.message])
        )
      )
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

  // Cc/Bcc rows: opened by their toggle, kept while they hold addresses
  const ccOpen = showCc || cc.length > 0
  const bccOpen = showBcc || bcc.length > 0

  return (
    <form
      onSubmit={onSubmit}
      onKeyDownCapture={(e) => {
        // Mod+Enter sends from anywhere, before the editor turns it into a line break
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !isPending) {
          e.preventDefault()
          e.stopPropagation()
          e.currentTarget.requestSubmit()
        }
      }}
      data-email-composer
      className={cn("relative flex flex-col", className)}
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
        <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2.5">
          <FieldLabel htmlFor="compose-to">To</FieldLabel>
          <div className="grid gap-1">
            <div className="flex items-center gap-1">
              <div className="min-w-0 flex-1">
                <EmailInput
                  id="compose-to"
                  value={to}
                  onChange={setTo}
                  suggestions={suggestions}
                  placeholder="name@example.com"
                  invalid={!!errors.to}
                />
              </div>
              {!ccOpen && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setShowCc(true)}
                >
                  Cc
                </Button>
              )}
              {!bccOpen && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => setShowBcc(true)}
                >
                  Bcc
                </Button>
              )}
            </div>
            <FieldError message={errors.to} />
          </div>

          {ccOpen && (
            <>
              <FieldLabel htmlFor="compose-cc">Cc</FieldLabel>
              <EmailChipsInput
                id="compose-cc"
                label="Cc"
                hideLabel
                value={cc}
                onChange={setCc}
                suggestions={suggestions}
                error={errors.cc}
              />
            </>
          )}

          {bccOpen && (
            <>
              <FieldLabel htmlFor="compose-bcc">Bcc</FieldLabel>
              <EmailChipsInput
                id="compose-bcc"
                label="Bcc"
                hideLabel
                value={bcc}
                onChange={setBcc}
                suggestions={suggestions}
                error={errors.bcc}
              />
            </>
          )}

          <FieldLabel htmlFor="compose-subject">Subject</FieldLabel>
          <div className="grid gap-1">
            <Input
              id="compose-subject"
              value={subject}
              maxLength={255}
              placeholder="What's this email about?"
              onChange={(e) => setSubject(e.target.value)}
              aria-invalid={!!errors.subject}
            />
            <FieldError message={errors.subject} />
          </div>
        </div>

        <div className="grid gap-1">
          <EmailBodyEditor
            content=""
            extensions={extensions}
            onReady={(editor) => (editorRef.current = editor)}
            onChange={() =>
              errors.body_html && setErrors(({ body_html: _, ...rest }) => rest)
            }
            placeholder="Write your message…"
            toolbarExtra={
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Control
                  title="Insert a record (@)"
                  aria-label="Insert a record"
                  onClick={() =>
                    editorRef.current?.chain().focus().insertContent("@").run()
                  }
                >
                  <AtSign className="size-4" />
                </RichTextEditor.Control>
              </RichTextEditor.ControlsGroup>
            }
            className={cn(
              "shadow-none",
              errors.body_html && "border-destructive"
            )}
          />
          <FieldError message={errors.body_html} />
        </div>

        {attachments.length > 0 && (
          <div className="grid gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Attachments · {attachments.length}/{MAX_ATTACHMENTS}
            </p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((a) => {
                const Icon = a.type === "invoice" ? ReceiptText : FileText
                return (
                  <div
                    key={`${a.type}:${a.id}`}
                    className="flex items-center gap-2 rounded-md border bg-muted/40 py-1.5 pr-1 pl-1.5"
                  >
                    <span className="grid size-7 place-items-center rounded bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium">{a.label}</span>
                    <span className="text-xs text-muted-foreground">PDF</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${a.label}`}
                      onClick={() =>
                        setRemoved((r) => [...r, `${a.type}:${a.id}`])
                      }
                    >
                      <X className="size-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t bg-background px-6 py-3">
        <AttachMenu
          onAttach={attach}
          disabled={attachments.length >= MAX_ATTACHMENTS}
        />
        <div className="ml-auto flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="button" variant="outline" onClick={openPreview}>
            <Eye className="size-4" /> Preview
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                {isPending ? "Sending…" : "Send"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Send{" "}
              <KbdGroup>
                <Kbd>{MOD_KEY}</Kbd>
                <Kbd>Enter</Kbd>
              </KbdGroup>
            </TooltipContent>
          </Tooltip>
        </div>
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

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <Label htmlFor={htmlFor} className="h-9 font-normal text-muted-foreground">
      {children}
    </Label>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null
}

function AttachMenu({
  onAttach,
  disabled,
}: {
  onAttach: (item: Attached) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          title={disabled ? `Up to ${MAX_ATTACHMENTS} attachments` : undefined}
        >
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
