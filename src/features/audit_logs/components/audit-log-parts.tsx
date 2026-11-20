import { BotIcon } from "lucide-react"
import {
  actionToneClasses,
  getActionTone,
  getInitials,
  humanize,
} from "../utils"
import type { AuditLog } from "../types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function AuditActionBadge({
  action,
  className,
}: {
  action: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium whitespace-nowrap",
        actionToneClasses[getActionTone(action)],
        className
      )}
    >
      {humanize(action)}
    </span>
  )
}

export function AuditActor({
  log,
  size = "sm",
}: {
  log: Pick<AuditLog, "actor_name" | "source">
  size?: "sm" | "default"
}) {
  const isSystem = log.source === "system" || !log.actor_name

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar size={size}>
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            isSystem && "bg-muted text-muted-foreground"
          )}
        >
          {isSystem ? (
            <BotIcon className="size-3.5" />
          ) : (
            getInitials(log.actor_name)
          )}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-medium">
          {isSystem ? "System" : log.actor_name}
        </span>
        <span className="text-xs text-muted-foreground capitalize">
          {log.source}
        </span>
      </div>
    </div>
  )
}
