import { LayoutGrid, Table2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type ListView = "cards" | "table"

export const LIST_VIEWS = ["cards", "table"] as const

const VIEWS = [
  { value: "cards", label: "Cards", icon: LayoutGrid },
  { value: "table", label: "Table", icon: Table2 },
] as const

/** Segmented Cards / Table switch for list screens. */
export function ViewToggle({
  value,
  onChange,
}: {
  value: ListView
  onChange: (view: ListView) => void
}) {
  return (
    <div
      role="group"
      aria-label="View"
      className="inline-flex gap-0.5 rounded-lg border bg-background p-0.5"
    >
      {VIEWS.map(({ value: option, label, icon: Icon }) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
            value === option &&
              "bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground"
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
