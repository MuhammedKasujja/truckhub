import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

/** One entry of a record's activity timeline (quotations, invoices). */
export type ActivityEntry<TType extends string = string> = {
  id: string
  type: TType
  occurred_at: string
  actor_id: string | null
  recipient_email: string | null
  details: Record<string, string | number | boolean | null>
}

export type ActivityTone = "success" | "info" | "warning" | "error" | "default"

export type ActivityMeta = { label: string; tone: ActivityTone }

const DOT_TONE: Record<ActivityTone, string> = {
  success: "bg-emerald-500",
  info: "bg-blue-500",
  warning: "bg-amber-500",
  error: "bg-destructive",
  default: "bg-muted-foreground",
}

type Props<TType extends string> = {
  activities: ActivityEntry<TType>[] | undefined
  /** Label and colour for each activity type. */
  meta: Record<TType, ActivityMeta>
  /** An extra line under the label, e.g. the amount of a payment. */
  describe?: (entry: ActivityEntry<TType>) => string | null | undefined
  isLoading?: boolean
  className?: string
}

/** What happened to a record, newest first. */
export function ActivityTimeline<TType extends string>({
  activities,
  meta,
  describe,
  isLoading,
  className,
}: Props<TType>) {
  if (isLoading && !activities) {
    return <p className="text-sm text-muted-foreground">Loading activity…</p>
  }

  const entries = [...(activities ?? [])].sort(
    (a, b) =>
      new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
  )

  if (!entries.length) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>
  }

  return (
    <ol className={className}>
      {entries.map((entry, i) => {
        const isLatest = i === 0
        const isLast = i === entries.length - 1
        // The API may add a type this build does not know yet
        const known: Partial<Record<TType, ActivityMeta>> = meta
        const { label, tone } = known[entry.type] ?? {
          label: entry.type.replace(/_/g, " "),
          tone: "default" as const,
        }
        const description = describe?.(entry)

        return (
          <li key={entry.id} className="flex gap-3">
            <div className="flex w-3 flex-col items-center pt-1.5">
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  DOT_TONE[tone],
                  isLatest && "ring-4 ring-primary/15"
                )}
              />
              {!isLast && <span className="my-1 w-px flex-1 bg-border" />}
            </div>
            <div className={cn("min-w-0", !isLast && "pb-4")}>
              <p
                className={cn(
                  "text-sm first-letter:uppercase",
                  isLatest && "font-medium"
                )}
              >
                {label}
              </p>
              <time
                dateTime={new Date(entry.occurred_at).toISOString()}
                className="text-xs text-muted-foreground"
              >
                {formatDateTime(entry.occurred_at)}
              </time>
              {entry.recipient_email && (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  To {entry.recipient_email}
                </p>
              )}
              {description && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
