import { useState } from "react"
import { X } from "lucide-react"
import { z } from "zod"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Props = {
  id: string
  label: string
  value: string[]
  onChange: (emails: string[]) => void
  suggestions?: string[]
  error?: string
}

const isEmail = (v: string) => z.email().safeParse(v).success

/** Several email addresses: Enter, comma or leaving the field turns the text into a chip. */
export function EmailChipsInput({ id, label, value, onChange, suggestions = [], error }: Props) {
  const [draft, setDraft] = useState("")
  const [invalid, setInvalid] = useState(false)

  function commit(text = draft) {
    const parts = text.split(/[\s,;]+/).map((p) => p.trim()).filter(Boolean)
    if (!parts.length) return
    const bad = parts.filter((p) => !isEmail(p))
    const good = parts.filter((p) => isEmail(p) && !value.includes(p))
    if (good.length) onChange([...value, ...good])
    setDraft(bad.join(", "))
    setInvalid(bad.length > 0)
  }

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div
        className={cn(
          "border-input focus-within:ring-ring/50 flex min-h-9 flex-wrap items-center gap-1 rounded-md border px-2 py-1 focus-within:ring-[3px]",
          (invalid || error) && "border-destructive"
        )}
      >
        {value.map((email) => (
          <span key={email} className="bg-secondary flex items-center gap-1 rounded px-1.5 py-0.5 text-xs">
            {email}
            <button type="button" aria-label={`Remove ${email}`} onClick={() => onChange(value.filter((e) => e !== email))}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          list={`${id}-suggestions`}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            setInvalid(false)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault()
              commit()
            } else if (e.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1))
            }
          }}
          onBlur={() => commit()}
          className="min-w-32 flex-1 bg-transparent py-0.5 text-sm outline-none"
        />
        <datalist id={`${id}-suggestions`}>
          {suggestions.filter((s) => !value.includes(s)).map((email) => (
            <option key={email} value={email} />
          ))}
        </datalist>
      </div>
      {(invalid || error) && (
        <p className="text-destructive text-xs">{invalid ? "Not a valid email address" : error}</p>
      )}
    </div>
  )
}
