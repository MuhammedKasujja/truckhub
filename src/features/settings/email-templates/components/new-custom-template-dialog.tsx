import { useState } from "react"
import { MailPlus } from "lucide-react"
import { CUSTOM_KEY_PREFIX, NewCustomTemplateSchema } from "../schemas"
import { useSaveEmailTemplate } from "../hooks/use-email-templates"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SettingsFormDialog } from "@/features/settings/_components/settings-ui"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingKeys: string[]
  onCreated: (key: string) => void
}

const STARTER_BODY = "<p>Hello,</p><p>Write your message here.</p>"

/** Creates a custom template right away, with a starter body to edit. */
export function NewCustomTemplateDialog({
  open,
  onOpenChange,
  existingKeys,
  onCreated,
}: Props) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState<string>()
  const save = useSaveEmailTemplate({ successMessage: "Custom template created" })

  function close(next: boolean) {
    if (!next) {
      setName("")
      setSlug("")
      setError(undefined)
    }
    onOpenChange(next)
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = NewCustomTemplateSchema.safeParse({ name, slug })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message)
      return
    }
    const key = `${CUSTOM_KEY_PREFIX}${parsed.data.slug}`
    if (existingKeys.includes(key)) {
      setError(`A template called ${key} already exists`)
      return
    }
    setError(undefined)
    save.mutate(
      {
        key,
        name: parsed.data.name,
        subject: parsed.data.name,
        html: STARTER_BODY,
        design: null,
        is_active: true,
      },
      {
        onSuccess: ({ isSuccess, error: apiError }) => {
          if (!isSuccess) {
            setError(apiError?.message)
            return
          }
          close(false)
          onCreated(key)
        },
      }
    )
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={close}
      icon={MailPlus}
      title="Add custom template"
      description="For emails you send yourself. Values you pass when sending fill in its {{ variables }}."
      onSubmit={submit}
      isSubmitting={save.isPending}
      submitText="Create template"
      size="sm"
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="custom-template-name">Name</Label>
          <Input
            id="custom-template-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              // Suggest a key from the name until the user edits the key
              if (!slug || slug === toSlug(name)) setSlug(toSlug(e.target.value))
            }}
            placeholder="Welcome email"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="custom-template-key">Key</Label>
          <div className="flex items-center rounded-md border focus-within:ring-3 focus-within:ring-ring/50">
            <span className="pl-3 font-mono text-sm text-muted-foreground">
              {CUSTOM_KEY_PREFIX}
            </span>
            <Input
              id="custom-template-key"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="welcome"
              className="border-0 pl-0.5 font-mono shadow-none focus-visible:ring-0"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Used to send it through the API. It can't be changed later.
          </p>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </SettingsFormDialog>
  )
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 61)
}
