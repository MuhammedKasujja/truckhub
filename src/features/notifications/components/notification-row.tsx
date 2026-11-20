import { useNavigate } from "@tanstack/react-router"
import { notificationLink } from "../navigation"
import type { NotificationItem } from "../types"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
  notification: NotificationItem
  onRead: (notification: NotificationItem) => void
  /** Called after the row was activated, e.g. to close the dropdown. */
  onOpen?: () => void
  className?: string
}

/** One notification: activating it marks it read and opens what it is about. */
export function NotificationRow({
  notification: n,
  onRead,
  onOpen,
  className,
}: Props) {
  const navigate = useNavigate()
  const link = notificationLink(n)

  return (
    <button
      type="button"
      onClick={() => {
        onRead(n)
        if (link) navigate(link)
        onOpen?.()
      }}
      className={cn(
        "flex w-full items-start gap-2.5 border-b px-3 py-2.5 text-left transition last:border-b-0 hover:bg-muted",
        n.is_read && "bg-muted/40",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          n.is_read ? "bg-transparent" : "bg-primary"
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span
            className={cn(
              "truncate text-sm",
              n.is_read ? "font-normal" : "font-medium"
            )}
          >
            {n.title}
          </span>
          <time
            dateTime={n.created_at}
            className="shrink-0 text-[10px] text-muted-foreground"
          >
            {formatDateTime(n.created_at)}
          </time>
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {n.body}
        </span>
        {!n.is_read && <span className="sr-only">Unread</span>}
      </span>
    </button>
  )
}
