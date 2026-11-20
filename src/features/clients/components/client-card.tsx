import { Link } from "@tanstack/react-router"
import { IconShieldStar } from "@tabler/icons-react"
import { MailIcon, PhoneIcon } from "lucide-react"
import { ClientActionsMenu } from "./client-actions-menu"
import type { Client } from "../types"
import { Badge } from "@/components/ui/badge"
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
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <dt>
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="sr-only">{label}</span>
      </dt>
      <dd className="min-w-0 truncate">{children}</dd>
    </div>
  )
}

export function ClientCard({ client }: { client: Client }) {
  const balance = client.financial_summary?.balance ?? client.balance

  return (
    <article className="flex flex-col rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <ClientMonogram client={client} />
        <div className="min-w-0 flex-1">
          <Link
            to="/clients/$clientId/view"
            params={{ clientId: client.id }}
            className="block truncate text-sm font-semibold capitalize outline-none hover:underline focus-visible:underline"
          >
            {client.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {client.number || "No client number"}
          </p>
        </div>
        <ClientActionsMenu client={client} />
      </div>

      <dl className="flex flex-1 flex-col gap-2 border-t px-4 py-3 text-sm">
        <DetailRow icon={PhoneIcon} label="Phone">
          {client.phone ? (
            <a href={`tel:${client.phone}`} className="hover:underline">
              {client.phone}
            </a>
          ) : (
            <span className="text-muted-foreground">No phone</span>
          )}
        </DetailRow>
        <DetailRow icon={MailIcon} label="Email">
          {client.email ? (
            <a href={`mailto:${client.email}`} className="hover:underline">
              {client.email}
            </a>
          ) : (
            <span className="text-muted-foreground">No email</span>
          )}
        </DetailRow>
      </dl>

      <div className="flex items-center justify-between gap-2 border-t px-4 py-2.5 text-xs text-muted-foreground">
        <ClientTypeBadge type={client.client_type} />
        <span>Since {formatDate(client.created_at)}</span>
      </div>
      {Number(balance) !== 0 && (
        <div className="flex items-center justify-between gap-2 border-t px-4 py-2.5 text-xs">
          <span className="text-muted-foreground">Balance</span>
          <ClientBalance balance={balance} className="text-sm" />
        </div>
      )}
    </article>
  )
}

export function ClientCardSkeleton() {
  return <div className="h-52 animate-pulse rounded-xl bg-muted/60" />
}
