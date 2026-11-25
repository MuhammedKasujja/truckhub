import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react"
import {
  Banknote,
  Building2,
  Car,
  ChevronRight,
  FileText,
  ReceiptText,
  Truck,
  User,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"
import { MENTION_REGISTRY } from "./registry"
import { fieldItems, selectionFor } from "./entity-mention"
import type { MentionHit, MentionType } from "./registry"
import type { SuggestionKeyDownProps, SuggestionProps } from "@tiptap/suggestion"
import type { QueryClient } from "@tanstack/react-query"
import type { MentionItem, MentionSelection } from "./entity-mention"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export type MentionListHandle = {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

type Props = SuggestionProps<MentionItem, MentionSelection> & {
  queryClient: QueryClient
}

const ICONS: Record<MentionType, React.ComponentType<{ className?: string }>> = {
  invoice: ReceiptText,
  quotation: FileText,
  payment: Banknote,
  trip: Truck,
  client: Building2,
  driver: UserRound,
  vehicle: Car,
  user: User,
}

/** The `@` popup: records grouped by type, then the chosen record's fields. */
export const MentionList = forwardRef<MentionListHandle, Props>(function MentionListPopup(
  { items, command, queryClient, query },
  ref
) {
  // A record picked from the list: show its fields until something is inserted
  const [picked, setPicked] = useState<MentionHit | null>(null)
  const [active, setActive] = useState(0)
  const [busy, setBusy] = useState(false)

  const rows: MentionItem[] = useMemo(
    () => (picked ? [{ kind: "reference", hit: picked }, ...fieldItems(picked)] : items),
    [items, picked]
  )

  useEffect(() => {
    setPicked(null) // typing again goes back to search results
  }, [query])

  useEffect(() => setActive(0), [rows])

  async function choose(row: MentionItem | undefined) {
    if (!row || busy) return
    if (row.kind === "type") return command({ kind: "type", type: row.type })
    if (row.kind === "record") return setPicked(row.hit)
    setBusy(true)
    try {
      command(await selectionFor(queryClient, row))
    } catch {
      toast.error("Couldn't load that value")
    } finally {
      setBusy(false)
    }
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowDown") {
        setActive((i) => (i + 1) % Math.max(rows.length, 1))
        return true
      }
      if (event.key === "ArrowUp") {
        setActive((i) => (i - 1 + rows.length) % Math.max(rows.length, 1))
        return true
      }
      if (event.key === "Enter" || event.key === "Tab") {
        void choose(rows[active])
        return true
      }
      if (event.key === "Backspace" && picked) {
        setPicked(null)
        return true
      }
      return false
    },
  }))

  return (
    <div className="bg-popover text-popover-foreground z-50 max-h-80 w-80 overflow-y-auto rounded-md border p-1 text-sm shadow-md">
      {picked && (
        <div className="text-muted-foreground flex items-center gap-1 px-2 py-1 text-xs">
          {MENTION_REGISTRY[picked.type].label} {picked.display}
          <ChevronRight className="size-3" /> pick a value
          {busy && <Spinner className="ml-auto size-3" />}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-muted-foreground px-2 py-3 text-center">No matches</div>
      ) : (
        rows.map((row, index) => {
          const previous = rows[index - 1] as MentionItem | undefined
          const groupStart =
            row.kind === "record" &&
            (previous?.kind !== "record" || previous.hit.type !== row.hit.type)
          return (
            <div key={rowKey(row)}>
              {groupStart && (
                <div className="text-muted-foreground px-2 pt-2 pb-1 text-xs font-medium">
                  {MENTION_REGISTRY[row.hit.type].label}
                </div>
              )}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // keep the editor focused
                onClick={() => void choose(row)}
                onMouseEnter={() => setActive(index)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left",
                  index === active && "bg-accent text-accent-foreground"
                )}
              >
                <RowContent row={row} />
              </button>
            </div>
          )
        })
      )}

      {!picked && rows[0]?.kind === "record" && (
        <div className="text-muted-foreground border-t px-2 pt-1.5 pb-1 text-xs">
          Enter to pick a value · type <kbd>invoice</kbd>, <kbd>trip</kbd>… first to narrow
        </div>
      )}
    </div>
  )
})

function RowContent({ row }: { row: MentionItem }) {
  if (row.kind === "type") {
    const Icon = ICONS[row.type]
    return (
      <>
        <Icon className="text-muted-foreground size-4" />
        <span>{MENTION_REGISTRY[row.type].label}</span>
        <span className="text-muted-foreground ml-auto text-xs">
          @{MENTION_REGISTRY[row.type].aliases[0]}
        </span>
      </>
    )
  }
  if (row.kind === "record") {
    const Icon = ICONS[row.hit.type]
    return (
      <>
        <Icon className="text-muted-foreground size-4 shrink-0" />
        <span className="truncate font-medium">{row.hit.display}</span>
        {row.hit.secondary && (
          <span className="text-muted-foreground ml-auto truncate text-xs">{row.hit.secondary}</span>
        )}
        <ChevronRight className="text-muted-foreground size-3 shrink-0" />
      </>
    )
  }
  if (row.kind === "reference") {
    return (
      <>
        <span>Insert as reference</span>
        <span className="text-muted-foreground ml-auto text-xs">{row.hit.display}</span>
      </>
    )
  }
  return (
    <>
      <span>{row.label}</span>
      <span className="text-muted-foreground ml-auto font-mono text-xs">.{row.path}</span>
    </>
  )
}

function rowKey(row: MentionItem): string {
  if (row.kind === "type") return `type:${row.type}`
  const base = `${row.hit.type}:${row.hit.id}`
  if (row.kind === "field") return `${base}.${row.path}`
  return `${row.kind}:${base}`
}

