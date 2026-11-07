import {
  AtSign,
  CalendarDays,
  Clock,
  MailIcon,
  PhoneIcon,
  ShieldCheck,
  UserIcon,
} from "lucide-react"
import type { SystemUser } from "../types"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatDateTime } from "@/lib/format"
import {
  DetailItem,
  MissingValue,
} from "@/features/settings/_components/settings-ui"

type UserProfileViewProps = {
  user: SystemUser
}

function initials(user: SystemUser) {
  const parts = [user.first_name, user.last_name].filter(Boolean)
  const source = parts.length ? parts : user.name.split(/\s+/)
  return source
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("")
}

/** Identity card: avatar, name, roles and when the account was created. */
export function UserProfileCard({ user }: UserProfileViewProps) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-xs">
      <div className="flex flex-col items-center gap-3 border-b bg-muted/30 px-5 pt-7 pb-5 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-sm ring-4 ring-background">
          {initials(user) || <UserIcon className="size-8" />}
        </div>
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold tracking-tight">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {user.is_admin && (
            <Badge>
              <ShieldCheck />
              Administrator
            </Badge>
          )}
          {user.roles.map((role) => (
            <Badge key={role.id} variant="secondary" title={role.description}>
              {role.name}
            </Badge>
          ))}
          {!user.is_admin && user.roles.length === 0 && (
            <Badge variant="outline">No roles assigned</Badge>
          )}
        </div>
      </div>
      <dl className="divide-y text-sm">
        {user.number && (
          <div className="flex items-center justify-between gap-3 px-5 py-3">
            <dt className="text-muted-foreground">User no.</dt>
            <dd className="font-mono text-xs font-medium">{user.number}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="size-4" />
            Joined
          </dt>
          <dd className="font-medium">{formatDate(user.created_at)}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" />
            Last sign-in
          </dt>
          <dd className="font-medium">
            {user.last_login ? formatDateTime(user.last_login) : <MissingValue>Never</MissingValue>}
          </dd>
        </div>
      </dl>
    </section>
  )
}

/** Contact and login details in a two-column grid. */
export function UserProfileView({ user }: UserProfileViewProps) {
  return (
    <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
      <DetailItem icon={UserIcon} label="Full name">
        {user.name}
      </DetailItem>
      <DetailItem icon={AtSign} label="Username">
        {user.username || <MissingValue />}
      </DetailItem>
      <DetailItem icon={MailIcon} label="Email">
        {user.email || <MissingValue />}
      </DetailItem>
      <DetailItem icon={PhoneIcon} label="Phone">
        {user.phone || <MissingValue />}
      </DetailItem>
    </div>
  )
}
