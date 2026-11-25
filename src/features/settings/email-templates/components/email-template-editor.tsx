import { useRef, useState } from "react"
import { AlertCircle, Eye, Mail, RotateCcw, Save, Trash2 } from "lucide-react"
import {
  INVALID_TEMPLATE_CODE,
  usePreviewEmailTemplate,
  useResetEmailTemplate,
  useSaveEmailTemplate,
} from "../hooks/use-email-templates"
import {
  initialEditorContent,
  isCustomTemplate,
  isFullHtmlDocument,
  isTiptapDesign,
} from "../utils"
import { EmailBodyEditor } from "./email-body-editor"
import { EmailPreviewDialog } from "./email-preview-dialog"
import { VariablePicker } from "./variable-picker"
import type { Editor } from "@tiptap/react"
import type { EmailTemplate, TemplateVariable } from "../types"
import type { EmailBodyChange } from "./email-body-editor"
import type { AppErrorDetails } from "@/types"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SettingsSection } from "@/features/settings/_components/settings-ui"

type Props = {
  /** Remount (change `key`) to load another template or a saved version */
  template: EmailTemplate
  variables: TemplateVariable[]
  canEdit: boolean
}

export function EmailTemplateEditor({ template, variables, canEdit }: Props) {
  const custom = isCustomTemplate(template.key)
  const [name, setName] = useState(template.name)
  const [subject, setSubject] = useState(template.subject)
  const [isActive, setIsActive] = useState(template.is_active)
  const [body, setBody] = useState<EmailBodyChange | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const editorRef = useRef<Editor | null>(null)
  const subjectRef = useRef<HTMLInputElement>(null)

  const save = useSaveEmailTemplate()
  const preview = usePreviewEmailTemplate()
  const reset = useResetEmailTemplate()

  const dirty =
    body !== null ||
    name !== template.name ||
    subject !== template.subject ||
    isActive !== template.is_active
  const bodyEmpty = body?.isEmpty ?? false
  // Opened from HTML that wasn't made in this editor: saving rewrites it
  const importedDocument =
    !isTiptapDesign(template.design) && isFullHtmlDocument(template.html)

  const validationError =
    invalidTemplateError(save.data?.error) ??
    (previewOpen ? undefined : invalidTemplateError(preview.data?.error))

  function currentBody() {
    const editor = editorRef.current
    return {
      html: body?.html ?? editor?.getHTML() ?? template.html,
      // ProseMirror keeps attrs in null-prototype objects; clone into plain JSON for the server
      json: structuredClone(body?.json ?? editor?.getJSON()),
    }
  }

  function handleSave() {
    const { html, json } = currentBody()
    save.mutate({
      key: template.key,
      name,
      subject,
      html,
      design: json ? { format: "tiptap", doc: json } : null,
      is_active: isActive,
    })
  }

  function handlePreview() {
    preview.reset()
    preview.mutate(
      { key: template.key, subject, html: currentBody().html },
      { onSuccess: ({ isSuccess }) => setPreviewOpen(isSuccess) }
    )
  }

  function insertIntoBody(token: string) {
    editorRef.current?.chain().focus().insertContent(token).run()
  }

  function insertIntoSubject(token: string) {
    const input = subjectRef.current
    const start = input?.selectionStart ?? subject.length
    const end = input?.selectionEnd ?? subject.length
    setSubject(subject.slice(0, start) + token + subject.slice(end))
    // Put the caret after the inserted token once React has updated the value
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(start + token.length, start + token.length)
    })
  }

  return (
    <>
      <SettingsSection
        icon={Mail}
        title={template.name}
        description={
          <code className="font-mono">{template.key}</code>
        }
        action={
          custom ? null : template.customized ? (
            <Badge>Customized</Badge>
          ) : (
            <Badge variant="secondary">Built-in default</Badge>
          )
        }
        footer={
          <>
            {canEdit && template.customized && (
              <Button
                type="button"
                variant="ghost"
                className="mr-auto"
                onClick={() => setConfirmReset(true)}
                disabled={reset.isPending}
              >
                {custom ? <Trash2 className="size-4" /> : <RotateCcw className="size-4" />}
                {custom ? "Delete" : "Reset to default"}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={preview.isPending || bodyEmpty || !subject.trim()}
            >
              <Eye className="size-4" />
              {preview.isPending ? "Rendering…" : "Preview"}
            </Button>
            {canEdit && (
              <Button
                type="button"
                onClick={handleSave}
                disabled={
                  save.isPending ||
                  !dirty ||
                  bodyEmpty ||
                  !name.trim() ||
                  !subject.trim()
                }
              >
                <Save className="size-4" />
                {save.isPending ? "Saving…" : "Save"}
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-col gap-5">
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>{validationError.message}</AlertTitle>
              {describeValidation(validationError) && (
                <AlertDescription>{describeValidation(validationError)}</AlertDescription>
              )}
            </Alert>
          )}

          {importedDocument && (
            <Alert>
              <AlertCircle />
              <AlertTitle>This template is a full HTML document</AlertTitle>
              <AlertDescription>
                It was made outside this editor and is sent without the shared
                layout. Saving here replaces it with what you see in the editor.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email-template-name">Name</Label>
              <Input
                id="email-template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canEdit}
                maxLength={255}
              />
            </div>
            <div className="flex items-end justify-between gap-3 sm:justify-start">
              <div className="flex items-center gap-2.5 pb-2">
                <Switch
                  id="email-template-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={!canEdit}
                />
                <Label htmlFor="email-template-active" className="font-normal">
                  {custom
                    ? "Active (inactive templates can't be sent)"
                    : "Active (when off, the built-in default is sent)"}
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="email-template-subject">Subject</Label>
              <VariablePicker
                variables={variables}
                onInsert={insertIntoSubject}
                disabled={!canEdit}
                label="Variable"
              />
            </div>
            <Input
              id="email-template-subject"
              ref={subjectRef}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!canEdit}
              maxLength={255}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Message</Label>
            <EmailBodyEditor
              content={initialEditorContent(template)}
              onChange={setBody}
              onReady={(editor) => {
                editorRef.current = editor
              }}
              editable={canEdit}
              toolbarExtra={
                <VariablePicker variables={variables} onInsert={insertIntoBody} />
              }
            />
            <p className="text-xs text-muted-foreground">
              {variables.length > 0
                ? "Variables such as {{ client.name }} are replaced when the email is sent. The email is placed inside the shared layout with your company name."
                : "Write {{ name }} for each value you pass when sending this template. The email is placed inside the shared layout with your company name."}
            </p>
          </div>
        </div>
      </SettingsSection>

      <EmailPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        email={preview.data?.isSuccess ? preview.data.data : undefined}
        isLoading={preview.isPending}
      />

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        isLoading={reset.isPending}
        title={custom ? "Delete this template?" : "Reset to the built-in default?"}
        description={
          custom
            ? "Emails can no longer be sent with it. This can't be undone."
            : "Your version is deleted and clients receive the built-in email again."
        }
        confirmLabel={custom ? "Delete" : "Reset"}
        onConfirm={() =>
          reset.mutate(template.key, { onSettled: () => setConfirmReset(false) })
        }
      />
    </>
  )
}

function invalidTemplateError(error?: AppErrorDetails) {
  return error?.code === INVALID_TEMPLATE_CODE ? error : undefined
}

/** "In the message, line 3" / "Unknown: password, foo" from the API's details. */
function describeValidation(error: AppErrorDetails) {
  const details = error.details
  if (!details) return undefined
  const parts: string[] = []
  const where = details.field === "subject" ? "In the subject" : "In the message"
  parts.push(typeof details.line === "number" ? `${where}, line ${details.line}` : where)
  if (Array.isArray(details.unknown) && details.unknown.length > 0) {
    parts.push(
      `Not available here: ${details.unknown.join(", ")}. Use the variable picker to see what is.`
    )
  }
  return parts.join(". ")
}
