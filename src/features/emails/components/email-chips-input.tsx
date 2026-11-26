import { useMemo, useState } from "react"
import { z } from "zod"
import { useDialogPortalContainer } from "./email-input"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"

type Props = {
  id: string
  label: string
  value: string[]
  onChange: (emails: string[]) => void
  suggestions?: string[]
  error?: string
  /** For a layout that shows the label beside the field */
  hideLabel?: boolean
  placeholder?: string
}

const isEmail = (v: string) => z.email().safeParse(v).success

/**
 * Several email addresses as chips. Pick a suggestion, or type an address and
 * press Enter / comma (or leave the field). Pasting a list splits it.
 */
export function EmailChipsInput({
  id,
  label,
  value,
  onChange,
  suggestions = [],
  error,
  hideLabel,
  placeholder,
}: Props) {
  const anchor = useComboboxAnchor()
  const [draft, setDraft] = useState("")
  const [invalid, setInvalid] = useState(false)
  const portal = useDialogPortalContainer()

  // A valid typed address that isn't a suggestion yet becomes the first item,
  // so Enter picks it the same way it picks a suggestion.
  const items = useMemo(() => {
    const typed = draft.trim()
    const base = suggestions.filter((s) => !value.includes(s))
    return isEmail(typed) && !base.includes(typed) && !value.includes(typed)
      ? [typed, ...base]
      : base
  }, [draft, suggestions, value])

  function commit(text = draft) {
    const parts = text
      .split(/[\s,;]+/)
      .map((p) => p.trim())
      .filter(Boolean)
    if (!parts.length) return
    const bad = parts.filter((p) => !isEmail(p))
    const good = parts.filter((p) => isEmail(p) && !value.includes(p))
    if (good.length) onChange([...value, ...new Set(good)])
    setDraft(bad.join(", "))
    setInvalid(bad.length > 0)
  }

  const message = invalid ? "Not a valid email address" : error

  return (
    <div ref={portal.ref} className="grid gap-1.5">
      {!hideLabel && <Label htmlFor={id}>{label}</Label>}
      <Combobox
        multiple
        autoHighlight
        items={items}
        value={value}
        onValueChange={(next) => {
          onChange(next)
          setInvalid(false)
        }}
        inputValue={draft}
        onInputValueChange={(text) => {
          setDraft(text)
          setInvalid(false)
        }}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(selected: string[]) =>
              selected.map((email) => (
                <ComboboxChip key={email}>{email}</ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsInput
            id={id}
            aria-label={hideLabel ? label : undefined}
            placeholder={value.length ? undefined : placeholder}
            aria-invalid={!!message || undefined}
            onKeyDown={(e) => {
              if (e.key === ",") {
                e.preventDefault()
                commit()
              } else if (e.key === "Enter" && draft.trim() && !items.length) {
                // Nothing to pick: flag the text instead of submitting the form.
                e.preventDefault()
                commit()
              }
            }}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text")
              if (/[\s,;]/.test(text.trim())) {
                e.preventDefault()
                commit(`${draft} ${text}`)
              }
            }}
            onBlur={() => commit()}
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchor} container={portal.container}>
          <ComboboxList>
            {(email: string) => (
              <ComboboxItem key={email} value={email}>
                {email}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {message && <p className="text-xs text-destructive">{message}</p>}
    </div>
  )
}
