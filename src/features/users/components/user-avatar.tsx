import { UserIcon } from "lucide-react"
import type { SystemUser } from "../types"
import { cn } from "@/lib/utils"

type AvatarUser = Pick<SystemUser, "name"> &
  Partial<Pick<SystemUser, "first_name" | "last_name">>

export function userInitials(user: AvatarUser) {
  const parts = [user.first_name, user.last_name].filter(
    (p): p is string => !!p
  )
  const source = parts.length ? parts : user.name.split(/\s+/)
  return source
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("")
}

const sizes = {
  sm: "size-7 text-[11px]",
  md: "size-10 text-sm",
  lg: "size-16 text-xl",
} as const

/** Initials avatar; admins get the solid primary fill. */
export function UserAvatar({
  user,
  size = "md",
  className,
}: {
  user: AvatarUser & Partial<Pick<SystemUser, "is_admin">>
  size?: keyof typeof sizes
  className?: string
}) {
  const initials = userInitials(user)
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
        user.is_admin && "bg-primary text-primary-foreground",
        sizes[size],
        className
      )}
    >
      {initials || <UserIcon className="size-1/2" />}
    </span>
  )
}

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })

const steps: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
]

/** "3 days ago", "yesterday", "just now". */
export function formatRelativeTime(date: string | Date | null | undefined) {
  if (!date) return null
  const seconds = (new Date(date).getTime() - Date.now()) / 1000
  if (Number.isNaN(seconds)) return null
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) {
      return relative.format(Math.round(seconds / size), unit)
    }
  }
  return "just now"
}
