import { Link } from "@tanstack/react-router"
import { IconShieldStar } from "@tabler/icons-react"
import { MailIcon, PhoneIcon } from "lucide-react"
import { ClientActionsMenu } from "./client-actions-menu"
import type { Client } from "../types"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatMoney, generateAvatorFallback } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Square initials tile, matching the client profile header. */
export function ClientMonogram({
  client,
  className,
}: {
  client: Pick<Client, "name" | "short_name">
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary uppercase",
        className
      )}
    >
      {(client.short_name || generateAvatorFallback(client.name)).slice(0, 4)}
    </span>
  )
}

export function ClientTypeBadge({ type }: { type: Client["client_type"] }) {
  if (type === "premium") {
    return (
      <Badge className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
        <IconShieldStar stroke={2} className="size-3.5" />
        Premium
      </Badge>
    )
  }
  return <Badge variant="outline">Standard</Badge>
}

/** Outstanding balance, coloured only when the client owes money. */
export function ClientBalance({
  balance,
  className,
}: {
  balance: Client["balance"] | null | undefined
  className?: string
}) {
  if (balance === null || balance === undefined) return null
  const owes = Number(balance) > 0
  return (
    <span
      className={cn(
        "font-medium tabular-nums",
        owes ? "text-destructive" : "text-muted-foreground",
        className
      )}
    >
      {formatMoney(balance)}
    </span>
  )
}

function DetailRow({
  icon: Icon,
  label,
  href,
  value,
  empty,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  value: string | null | undefined
  empty: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <dt className="shrink-0">
        <Icon className="size-3.5 text-muted-foreground" />
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="min-w-0 truncate">
        {value ? (
          // Sits above the card's stretched link so it stays clickable.
          <a
            href={href}
            className="relative z-10 text-foreground/90 hover:text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="text-muted-foreground/70">{empty}</span>
        )}
      </dd>
    </div>
  )
}

export function ClientCard({ client }: { client: Client }) {
  const balance = client.financial_summary?.balance ?? client.balance

  return (
    <article className="group relative flex flex-col rounded-xl border bg-card shadow-xs transition-[box-shadow,border-color] hover:border-primary/30 hover:shadow-md">
      <div className="flex items-start gap-3 p-4 pb-3">
        <ClientMonogram client={client} />
        <div className="min-w-0 flex-1 pt-0.5">
          {/* Stretched link: the whole card opens the client. */}
          <Link
            to="/clients/$clientId/view"
            params={{ clientId: client.id }}
            className="block truncate text-sm font-semibold capitalize outline-none group-hover:text-primary after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
          >
            {client.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {client.number || "No client number"}
            <span aria-hidden> · </span>
            Since {formatDate(client.created_at)}
          </p>
        </div>
        <div className="relative z-10 -mt-1 -mr-1.5">
          <ClientActionsMenu client={client} />
        </div>
      </div>

      <dl className="flex flex-1 flex-col gap-1.5 px-4 pb-4 text-sm">
        <DetailRow
          icon={PhoneIcon}
          label="Phone"
          href={`tel:${client.phone}`}
          value={client.phone}
          empty="No phone"
        />
        <DetailRow
          icon={MailIcon}
          label="Email"
          href={`mailto:${client.email}`}
          value={client.email}
          empty="No email"
        />
      </dl>

      <div className="flex min-h-11 items-center justify-between gap-2 rounded-b-xl border-t bg-muted/30 px-4 py-2">
        <ClientTypeBadge type={client.client_type} />
        <div className="flex items-baseline gap-1.5 text-xs">
          <span className="text-muted-foreground">Balance</span>
          <ClientBalance balance={balance} className="text-sm" />
        </div>
      </div>
    </article>
  )
}

/** Mirrors the card's layout so the grid doesn't jump when data arrives. */
export function ClientCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border bg-card shadow-xs">
      <div className="flex items-start gap-3 p-4 pb-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex flex-1 flex-col gap-1.5 pt-1">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      </div>
      <div className="flex flex-col gap-2.5 px-4 pb-4">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
      <div className="flex min-h-11 items-center justify-between border-t px-4 py-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}
