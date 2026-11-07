import React, { useState } from "react"
import { Link } from "@tanstack/react-router"
import { useQueries } from "@tanstack/react-query"
import { IconShieldStar } from "@tabler/icons-react"
import {
  AlertCircle,
  ArrowUpRight,
  CalendarClock,
  ChevronDown,
  CreditCard,
  FileText,
  Mail,
  Phone,
  PiggyBank,
  Receipt,
  UserRound,
  Users,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Can } from "@/components/has-permission"
import { ActionIcon, ModuleIcon } from "@/components/icons"
import { PageBackButton } from "@/components/page-header"
import { EntityId } from "@/schemas"
import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"
import {
  formatDate,
  formatDateTime,
  formatMoney,
  generateAvatorFallback,
} from "@/lib/format"
import {
  EnterPaymentModal,
  PaymentStatusIndicator,
} from "@/features/payments/components"
import { InvoiceStatusIndicator } from "@/features/invoices/components"
import type { QuotationStatus } from "@/features/quotations/enums"
import type { Quotation } from "@/features/quotations/types"
import type { Invoice } from "@/features/invoices/types"
import type { Payment } from "@/features/payments/types"
import {
  clientInvoicesQueryOptions,
  clientPaymentsQueryOptions,
  clientQuotationsQueryOptions,
} from "../query-options"
import { useClientProfileSuspenseQuery } from "../hooks/use-client"
import { ClientServicesDialog } from "./client-services-dialog"
import { ClientPricingConfigDialog } from "./pricing/client-pricing-config-dialog"
import type { Client, ClientContact } from "../types"

type ClientDetailsWrapperProps = {
  clientId: EntityId
}

const CLOSED_INVOICE_STATUSES = ["draft", "paid", "cancelled", "void", "refunded"]

export function CustomerDetailsWrapper({
  clientId,
}: ClientDetailsWrapperProps) {
  const { data: client } = useClientProfileSuspenseQuery(clientId)
  const [openPayment, setOpenPayment] = useState(false)

  const [
    { data: paymentsResponse },
    { data: invoicesResponse },
    { data: quotationsResponse },
  ] = useQueries({
    queries: [
      clientPaymentsQueryOptions(clientId),
      clientInvoicesQueryOptions(clientId),
      clientQuotationsQueryOptions(clientId),
    ],
  })

  const payments = paymentsResponse?.data ?? []
  const invoices = invoicesResponse?.data ?? []
  const quotations = quotationsResponse?.data ?? []

  const openInvoices = invoices.filter(
    (inv) =>
      !CLOSED_INVOICE_STATUSES.includes(inv.status) &&
      Number(inv.balance_due) > 0
  )
  const overdueCount = invoices.filter((inv) => inv.status === "over_due").length
  const summary = client.financial_summary
  const amountDue = Number(summary?.amount_due ?? 0)

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="-ml-2 pt-1">
              <PageBackButton />
            </div>
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary uppercase">
              {client.short_name ?? generateAvatorFallback(client.name)}
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-bold tracking-tight capitalize">
                  {client.name}
                </h1>
                {client.client_type === "premium" ? (
                  <Badge className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    <IconShieldStar stroke={2} className="size-3.5" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="outline">Standard</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {client.number}
                {client.created_at && (
                  <> · Client since {formatDate(client.created_at)}</>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm">
                {client.phone && (
                  <InlineContact
                    icon={Phone}
                    href={`tel:${client.phone.replace(/\s/g, "")}`}
                    value={client.phone}
                  />
                )}
                {client.email && (
                  <InlineContact
                    icon={Mail}
                    href={`mailto:${client.email}`}
                    value={client.email}
                  />
                )}
              </div>
            </div>
          </div>

          <ClientActions
            client={client}
            onEnterPayment={() => setOpenPayment(true)}
          />
        </div>

        {/* Financial summary */}
        <div className="grid grid-cols-2 divide-x divide-y border-t bg-muted/30 md:grid-cols-4 md:divide-y-0">
          <Stat
            icon={Wallet}
            label="Balance"
            value={formatMoney(summary?.balance ?? client.balance ?? 0)}
          />
          <Stat
            icon={AlertCircle}
            label="Amount due"
            value={formatMoney(summary?.amount_due ?? 0)}
            tone={amountDue > 0 ? "warning" : undefined}
            hint={
              openInvoices.length
                ? `${openInvoices.length} open invoice${openInvoices.length > 1 ? "s" : ""}${overdueCount ? ` · ${overdueCount} overdue` : ""}`
                : "Nothing outstanding"
            }
          />
          <Stat
            icon={PiggyBank}
            label="Paid to date"
            value={formatMoney(
              summary?.total_paid ?? client.paid_to_date ?? 0
            )}
            hint={`${payments.length} payment${payments.length === 1 ? "" : "s"}`}
          />
          <Stat
            icon={CreditCard}
            label="Credit available"
            value={formatMoney(summary?.credit_available ?? 0)}
            tone={
              Number(summary?.credit_available ?? 0) > 0 ? "success" : undefined
            }
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity */}
        <div className="min-w-0 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>
                Payments, quotations and invoices for this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="invoices" className="w-full">
                <TabsList variant="line">
                  <TabsTrigger value="invoices">
                    <ModuleIcon module="Invoices" />
                    Invoices
                    <CountBadge count={invoices.length} />
                  </TabsTrigger>
                  <TabsTrigger value="quotations">
                    <ModuleIcon module="Quotations" />
                    Quotations
                    <CountBadge count={quotations.length} />
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    <ModuleIcon module="Payments" />
                    Payments
                    <CountBadge count={payments.length} />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="invoices">
                  <InvoicesTable invoices={invoices} clientId={client.id} />
                </TabsContent>
                <TabsContent value="quotations">
                  <QuotationsTable quotations={quotations} clientId={client.id} />
                </TabsContent>
                <TabsContent value="payments">
                  <PaymentsTable
                    payments={payments}
                    onEnterPayment={() => setOpenPayment(true)}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ContactsCard clientId={client.id} contacts={client.contacts ?? []} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarClock className="size-4 text-muted-foreground" />
                Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <RecordRow label="Client number" value={client.number} />
                <RecordRow
                  label="Pricing"
                  value={
                    client.has_pricing ? (
                      <Link
                        to="/clients/data/$clientId"
                        params={{ clientId: client.id }}
                        className="font-medium text-primary hover:underline"
                      >
                        Custom pricing
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Default</span>
                    )
                  }
                />
                <RecordRow
                  label="Created"
                  value={formatDateTime(client.created_at)}
                />
                <RecordRow
                  label="Last updated"
                  value={formatDateTime(client.updated_at)}
                />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      <Can permission="payments:create">
        <EnterPaymentModal
          open={openPayment}
          onOpenChange={() => setOpenPayment(false)}
          initialData={{ type: "invoice", clientId: client.id }}
        />
      </Can>
    </div>
  )
}

/* ---------- Header actions ---------- */

function ClientActions({
  client,
  onEnterPayment,
}: {
  client: Client
  onEnterPayment: () => void
}) {
  const tr = useTranslation()
  const [openServices, setOpenServices] = useState(false)
  const [openPricing, setOpenPricing] = useState(false)
  const clientId = client.id

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 self-start">
      <Can permission="payments:create">
        <Button onClick={onEnterPayment}>
          <Wallet />
          {tr("payments.form.enterPayment")}
        </Button>
      </Can>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <ActionIcon action="create" />
            New
            <ChevronDown className="opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Can permission="quotations:create">
            <DropdownMenuItem asChild>
              <Link to="/quotations/new" search={{ clientId }}>
                <ModuleIcon module="Quotations" />
                Quotation
              </Link>
            </DropdownMenuItem>
          </Can>
          <Can permission="invoices:create">
            <DropdownMenuItem asChild>
              <Link to="/invoices/create" search={{ clientId }}>
                <ModuleIcon module="Invoices" />
                Invoice
              </Link>
            </DropdownMenuItem>
          </Can>
        </DropdownMenuContent>
      </DropdownMenu>

      <Can permission="clients:edit">
        <Button asChild variant="outline">
          <Link to="/clients/$clientId/edit" params={{ clientId }}>
            <ActionIcon action="edit" />
            Edit
          </Link>
        </Button>
      </Can>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            More
            <ChevronDown className="opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-48">
          <DropdownMenuItem asChild>
            <Link to="/clients/$clientId/pdf" params={{ clientId }}>
              <ActionIcon action="view-pdf" />
              View PDF
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setOpenServices(true)}>
            <ModuleIcon module="Services" />
            Manage services
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setOpenPricing(true)}>
            <ModuleIcon module="Settings" />
            Pricing settings
          </DropdownMenuItem>
          {client.has_pricing && (
            <DropdownMenuItem asChild>
              <Link to="/clients/data/$clientId" params={{ clientId }}>
                <CreditCard />
                View pricing
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ClientPricingConfigDialog
        clientId={clientId}
        open={openPricing}
        onOpenChange={setOpenPricing}
      />
      <ClientServicesDialog
        clientId={clientId}
        open={openServices}
        onOpenChange={setOpenServices}
      />
    </div>
  )
}

/* ---------- Activity tables ---------- */

type InvoiceRow = Invoice
type QuotationRow = Quotation
type PaymentRow = Payment

function InvoicesTable({
  invoices,
  clientId,
}: {
  invoices: InvoiceRow[]
  clientId: EntityId
}) {
  if (!invoices.length) {
    return (
      <EmptyState
        icon={Receipt}
        title="No invoices yet"
        description="Invoices issued to this client will appear here."
        action={
          <Can permission="invoices:create">
            <Button asChild size="sm">
              <Link to="/invoices/create" search={{ clientId }}>
                <ActionIcon action="create" />
                New invoice
              </Link>
            </Button>
          </Can>
        }
      />
    )
  }

  return (
    <TableShell>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Balance due</TableHead>
          <TableHead>Due date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => {
          const due = Number(inv.balance_due)
          return (
            <TableRow key={inv.id.toString()} className="group">
              <TableCell className="font-medium">
                <RowLink
                  to="/invoices/$invoiceId/view"
                  params={{ invoiceId: inv.id }}
                >
                  {inv.number}
                </RowLink>
              </TableCell>
              <TableCell>
                <InvoiceStatusIndicator status={inv.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMoney(inv.total)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right tabular-nums",
                  due > 0
                    ? "font-medium text-amber-700 dark:text-amber-400"
                    : "text-muted-foreground"
                )}
              >
                {formatMoney(inv.balance_due)}
              </TableCell>
              <TableCell
                className={cn(
                  "text-muted-foreground",
                  inv.status === "over_due" && "text-destructive"
                )}
              >
                {formatDate(inv.due_date)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </TableShell>
  )
}

function QuotationsTable({
  quotations,
  clientId,
}: {
  quotations: QuotationRow[]
  clientId: EntityId
}) {
  if (!quotations.length) {
    return (
      <EmptyState
        icon={FileText}
        title="No quotations yet"
        description="Quotations prepared for this client will appear here."
        action={
          <Can permission="quotations:create">
            <Button asChild size="sm">
              <Link to="/quotations/new" search={{ clientId }}>
                <ActionIcon action="create" />
                New quotation
              </Link>
            </Button>
          </Can>
        }
      />
    )
  }

  return (
    <TableShell>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotations.map((quote) => (
          <TableRow key={quote.id.toString()} className="group">
            <TableCell className="font-medium">
              <RowLink
                to="/quotations/$quotationId/view"
                params={{ quotationId: quote.id }}
              >
                {quote.number}
              </RowLink>
            </TableCell>
            <TableCell>
              <QuotationStatusBadge status={quote.status} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatMoney(quote.current_version?.total_amount)}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDate(quote.created_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableShell>
  )
}

function PaymentsTable({
  payments,
  onEnterPayment,
}: {
  payments: PaymentRow[]
  onEnterPayment: () => void
}) {
  const tr = useTranslation()

  if (!payments.length) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No payments yet"
        description="Payments received from this client will appear here."
        action={
          <Can permission="payments:create">
            <Button size="sm" onClick={onEnterPayment}>
              <Wallet />
              {tr("payments.form.enterPayment")}
            </Button>
          </Can>
        }
      />
    )
  }

  return (
    <TableShell>
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Paid at</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id.toString()}>
            <TableCell className="font-medium">{payment.number}</TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              {formatMoney(payment.amount)}
            </TableCell>
            <TableCell>
              <PaymentStatusIndicator status={payment.status} />
            </TableCell>
            <TableCell>{tr(`payments.methods.${payment.method}`)}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(payment.paid_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableShell>
  )
}

/* ---------- Contacts ---------- */

function ContactsCard({
  clientId,
  contacts,
}: {
  clientId: EntityId
  contacts: ClientContact[]
}) {
  const sorted = [...contacts].sort(
    (a, b) => Number(!!b.is_primary) - Number(!!a.is_primary)
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          Contacts
        </CardTitle>
        <CardDescription>
          {contacts.length
            ? `${contacts.length} contact${contacts.length > 1 ? "s" : ""}`
            : "No contact people added"}
        </CardDescription>
        {!contacts.length && (
          <Can permission="clients:edit">
            <CardAction>
              <Button asChild size="sm" variant="outline">
                <Link to="/clients/$clientId/edit" params={{ clientId }}>
                  Add
                </Link>
              </Button>
            </CardAction>
          </Can>
        )}
      </CardHeader>
      {sorted.length > 0 && (
        <CardContent className="space-y-3">
          {sorted.map((contact) => (
            <div
              key={contact.id.toString()}
              className="space-y-2 rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
                  {generateAvatorFallback(contact.name) || (
                    <UserRound className="size-4" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <p className="truncate font-medium capitalize">
                    {contact.name}
                  </p>
                  {contact.is_primary && (
                    <Badge variant="secondary" className="shrink-0">
                      Primary
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-0.5">
                {contact.phone && (
                  <ContactLink
                    icon={Phone}
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    value={contact.phone}
                  />
                )}
                {contact.email && (
                  <ContactLink
                    icon={Mail}
                    href={`mailto:${contact.email}`}
                    value={contact.email}
                  />
                )}
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}

/* ---------- Small pieces ---------- */

type IconType = React.ComponentType<{ className?: string }>

const QUOTATION_STATUS_STYLES: Record<QuotationStatus, string> = {
  draft: "bg-muted-foreground/60",
  sent: "bg-sky-500",
  accepted: "bg-emerald-500",
  rejected: "bg-red-500",
  invoiced: "bg-violet-500",
  expired: "bg-amber-500",
}

function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5 rounded-sm capitalize">
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-sm",
          QUOTATION_STATUS_STYLES[status] ?? "bg-muted-foreground/60"
        )}
      />
      {status.replace(/_/g, " ")}
    </Badge>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: IconType
  label: string
  value: React.ReactNode
  hint?: string
  tone?: "warning" | "success"
}) {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0 text-muted-foreground",
          tone === "warning" && "text-amber-600 dark:text-amber-400",
          tone === "success" && "text-emerald-600 dark:text-emerald-400"
        )}
      />
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p
          className={cn(
            "truncate text-xl font-semibold tabular-nums",
            tone === "warning" && "text-amber-700 dark:text-amber-400",
            tone === "success" && "text-emerald-700 dark:text-emerald-400"
          )}
        >
          {value}
        </p>
        {hint && (
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
  )
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="ml-0.5 rounded-full bg-muted px-1.5 py-px text-[11px] font-medium text-muted-foreground tabular-nums">
      {count}
    </span>
  )
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border bg-background">
      <Table>{children}</Table>
    </div>
  )
}

function RowLink(props: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className="inline-flex items-center gap-1 text-primary hover:underline"
    >
      {props.children as React.ReactNode}
      <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: IconType
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <Empty className="mt-2 border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}

function RecordRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right">{value}</dd>
    </div>
  )
}

function InlineContact({
  icon: Icon,
  href,
  value,
}: {
  icon: IconType
  href: string
  value: string
}) {
  return (
    <a
      href={href}
      className="inline-flex min-w-0 items-center gap-1.5 text-muted-foreground hover:text-foreground"
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{value}</span>
    </a>
  )
}

function ContactLink({
  icon: Icon,
  href,
  value,
}: {
  icon: IconType
  href: string
  value: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{value}</span>
    </a>
  )
}
