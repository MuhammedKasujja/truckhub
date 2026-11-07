import React from "react"
import { Link } from "@tanstack/react-router"
import Decimal from "decimal.js"
import {
  AlertCircle,
  ArrowUpRight,
  Copy,
  FileText,
  Mail,
  Phone,
  Undo2,
} from "lucide-react"
import { toast } from "sonner"
import {
  PAYMENT_METHOD_ICONS,
  PAYMENT_METHOD_REF_LABELS,
} from "./payment-method"
import { PaymentStatusIndicator } from "./payment-status-indicator"
import type { Payment } from "../types"
import { Can } from "@/components/has-permission"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Progress } from "@/components/ui/progress"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslation } from "@/i18n"
import {
  formatDateTime,
  formatMoney,
  generateAvatorFallback,
} from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
  payment: Payment
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Shown as a footer action when the payment can still be reversed. */
  onReverse?: () => void
}

const toDecimal = (value: string | number | null | undefined) => {
  try {
    return new Decimal(value || 0)
  } catch {
    return new Decimal(0)
  }
}

export function PaymentViewModal({
  payment,
  open,
  onOpenChange,
  onReverse,
}: Props) {
  const isMobile = useIsMobile()
  const tr = useTranslation()

  const MethodIcon = PAYMENT_METHOD_ICONS[payment.method]
  const canReverse = !!onReverse && payment.status !== "reversed"

  return (
    <Drawer
      direction={isMobile ? "bottom" : "right"}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader className="flex-row items-center gap-3 border-b text-left">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MethodIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <DrawerTitle className="truncate">{payment.number}</DrawerTitle>
              <PaymentStatusIndicator status={payment.status} />
            </div>
            <DrawerDescription>
              Paid {formatDateTime(payment.paid_at)}
            </DrawerDescription>
          </div>
        </DrawerHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 text-sm">
          <AmountSummary payment={payment} />

          {payment.status_reason && (
            <div className="flex gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-800 dark:text-amber-300">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-medium">
                  {tr(`payments.statuses.${payment.status}`)}
                </p>
                <p className="text-xs opacity-90">{payment.status_reason}</p>
              </div>
            </div>
          )}

          <PaidForCard payment={payment} />
          <ClientCard payment={payment} />

          <Section title="Details">
            <dl className="space-y-2.5">
              <Row label="Payment no." value={payment.number} />
              <Row
                label={tr("payments.method")}
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <MethodIcon className="size-3.5 text-muted-foreground" />
                    {tr(`payments.methods.${payment.method}`)}
                  </span>
                }
              />
              <Row
                label={PAYMENT_METHOD_REF_LABELS[payment.method]}
                value={
                  payment.transaction_ref ? (
                    <CopyValue value={payment.transaction_ref} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )
                }
              />
              <Row
                label={tr("payments.paid_at")}
                value={formatDateTime(payment.paid_at)}
              />
              <Row
                label="Recorded"
                value={formatDateTime(payment.created_at)}
              />
            </dl>
          </Section>
        </div>

        <DrawerFooter className="border-t">
          {canReverse && (
            <Can permission="payments:reverse">
              <Button variant="outline" onClick={onReverse}>
                <Undo2 className="size-4" />
                Reverse payment
              </Button>
            </Can>
          )}
          <DrawerClose asChild>
            <Button variant={canReverse ? "ghost" : "outline"} type="button">
              {tr("payments.form.close")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Sections                                  */
/* -------------------------------------------------------------------------- */

function AmountSummary({ payment }: { payment: Payment }) {
  const tr = useTranslation()
  const amount = toDecimal(payment.amount)
  const applied = toDecimal(payment.applied)
  const refunded = toDecimal(payment.refunded)
  const unapplied = Decimal.max(0, amount.minus(applied).minus(refunded))
  const appliedPercent = amount.gt(0)
    ? Math.min(100, applied.div(amount).times(100).toNumber())
    : 0
  const isVoid = payment.status === "reversed" || payment.status === "failed"

  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground">{tr("payments.amount")}</p>
      <p
        className={cn(
          "text-3xl font-bold tracking-tight tabular-nums",
          isVoid && "text-muted-foreground line-through"
        )}
      >
        {formatMoney(payment.amount)}
      </p>
      <p className="text-xs text-muted-foreground">
        via {tr(`payments.methods.${payment.method}`)}
      </p>

      <Progress
        value={appliedPercent}
        className="mt-4 h-2"
        aria-label="Share of the payment applied"
      />
      <dl className="mt-3 grid grid-cols-3 gap-2">
        <MiniStat label={tr("payments.applied")} value={applied} />
        <MiniStat label="Unapplied" value={unapplied} />
        <MiniStat label="Refunded" value={refunded} />
      </dl>
    </div>
  )
}

const ENTITY_LINKS = {
  invoice: (id: string) => ({
    to: "/invoices/$invoiceId/view" as const,
    params: { invoiceId: id },
  }),
  booking: (id: string) => ({
    to: "/bookings/$bookingId/view" as const,
    params: { bookingId: id },
  }),
  ride: (id: string) => ({
    to: "/rides/$rideId/view" as const,
    params: { rideId: id },
  }),
}

function PaidForCard({ payment }: { payment: Payment }) {
  const tr = useTranslation()
  const { entity } = payment
  const balance = toDecimal(entity.balance)
  const link = ENTITY_LINKS[payment.entity_type](entity.id)

  return (
    <Section title="Paid for">
      <Link
        {...link}
        className="group -m-2 flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <FileText className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium group-hover:underline">
            {tr(`payments.${payment.entity_type}`)} {entity.number}
          </p>
          <p className="text-xs text-muted-foreground">
            Total {formatMoney(entity.amount)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p
            className={cn(
              "font-medium tabular-nums",
              balance.gt(0)
                ? "text-amber-700 dark:text-amber-400"
                : "text-emerald-700 dark:text-emerald-400"
            )}
          >
            {balance.gt(0) ? formatMoney(entity.balance) : "Settled"}
          </p>
        </div>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    </Section>
  )
}

function ClientCard({ payment }: { payment: Payment }) {
  const tr = useTranslation()
  const { client } = payment

  return (
    <Section title={tr("payments.client")}>
      <Link
        to="/clients/$clientId/view"
        params={{ clientId: client.id }}
        className="group -m-2 flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase">
          {generateAvatorFallback(client.fullname)}
        </span>
        <span className="min-w-0 flex-1 truncate font-medium capitalize group-hover:underline">
          {client.fullname}
        </span>
        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
      {(client.phone || client.email) && (
        <div className="mt-2 space-y-0.5">
          {client.phone && (
            <ContactLink
              icon={Phone}
              href={`tel:${client.phone.replace(/\s/g, "")}`}
              value={client.phone}
            />
          )}
          {client.email && (
            <ContactLink
              icon={Mail}
              href={`mailto:${client.email}`}
              value={client.email}
            />
          )}
        </div>
      )}
    </Section>
  )
}

/* -------------------------------------------------------------------------- */
/*                                  Primitives                                */
/* -------------------------------------------------------------------------- */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border p-4">
      <h3 className="mb-3 text-xs font-medium text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right">{value}</dd>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: Decimal }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "truncate text-sm font-medium tabular-nums",
          value.eq(0) && "text-muted-foreground"
        )}
      >
        {formatMoney(value.toString())}
      </dd>
    </div>
  )
}

function ContactLink({
  icon: Icon,
  href,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  href: string
  value: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{value}</span>
    </a>
  )
}

function CopyValue({ value }: { value: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Could not copy to clipboard")
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex max-w-full items-center gap-1.5 font-mono text-xs hover:text-primary"
      title="Copy"
    >
      <span className="truncate">{value}</span>
      <Copy className="size-3 shrink-0 opacity-50 group-hover:opacity-100" />
    </button>
  )
}
