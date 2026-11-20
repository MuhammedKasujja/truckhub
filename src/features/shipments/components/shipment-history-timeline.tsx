import { SHIPMENT_STATUS_TONE } from "./shipment-status-indicator"
import type { ShipmentHistory } from "../types"
import { useTranslation } from "@/i18n"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
  history: ShipmentHistory[]
}

const DOT_TONE = {
  success: "bg-emerald-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
  error: "bg-destructive",
  default: "bg-muted-foreground",
} as const

/** Status changes, newest first. */
export function ShipmentHistoryTimeline({ history }: Props) {
  const tr = useTranslation()
  const entries = [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  if (!entries.length) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>
  }

  return (
    <ol>
      {entries.map((entry, i) => {
        const isLatest = i === 0
        const isLast = i === entries.length - 1
        return (
          <li
            key={`${entry.status}-${entry.created_at.toString()}`}
            className="flex gap-3"
          >
            <div className="flex w-3 flex-col items-center pt-1.5">
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  DOT_TONE[SHIPMENT_STATUS_TONE[entry.status]],
                  isLatest && "ring-4 ring-primary/15"
                )}
              />
              {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
            </div>
            <div className={cn("min-w-0", !isLast && "pb-4")}>
              <p className={cn("text-sm", isLatest && "font-medium")}>
                {tr(`shipments.status.${entry.status}`)}
              </p>
              <time
                dateTime={new Date(entry.created_at).toISOString()}
                className="text-xs text-muted-foreground"
              >
                {formatDateTime(entry.created_at)}
              </time>
              {entry.note && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {entry.note}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
