import { Button } from "@/components/ui/button"
import { invoiceDetailsQueryOptions } from "@/features/invoices/query-options"
import { formatDate, formatMoney } from "@/lib/format"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/invoices/$invoiceId/view")({
  component: RouteComponent,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      invoiceDetailsQueryOptions(params.invoiceId)
    ),
})

function RouteComponent() {
  const { data: invoice } = Route.useLoaderData()
  return (
    <div className="w-full">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {invoice.number}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Invoice ID {invoice.id.slice(0, 8)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground" asChild>
              <Link
                to="/invoices/$invoiceId/pdf"
                params={{ invoiceId: invoice.id }}
              >
                View PDF
              </Link>
            </Button>
            <Button className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground">
              Download PDF
            </Button>
            <Button className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
              Send to client
            </Button>
          </div>
        </div>

        {/* Overview */}
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Bill to
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {invoice.client.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Client {invoice.client.number} · {invoice.client.short_name}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Issued
              </p>
              <p className="mt-1 text-sm text-foreground">
                {formatDate(invoice.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Due date
              </p>
              <p className="mt-1 text-sm text-foreground">
                {formatDate(invoice.due_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium text-foreground">Line items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-xs font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                    Days
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                    Unit price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                    Fuel surcharge
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item) => (
                  <tr>
                    <td className="max-w-sm px-6 py-4 text-muted-foreground">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">
                      {item.service_days}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">
                      {formatMoney(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">
                      {item.fuel_surcharge
                        ? formatMoney(item.fuel_surcharge)
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-foreground">
                      {formatMoney(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
            <SummaryRow
              label="Subtotal"
              value={formatMoney(invoice.subtotal)}
            />
            <SummaryRow label="Tax" value={formatMoney(invoice.tax_amount)} />
            {Number(invoice.discount) > 0 && (
              <SummaryRow
                label="Discount"
                value={`- ${formatMoney(invoice.discount)}`}
              />
            )}
            <div className="my-2 h-px bg-border" />
            <SummaryRow label="Total" value={formatMoney(invoice.total)} bold />
            <SummaryRow
              label="Amount paid"
              value={formatMoney(invoice.amount_paid)}
              muted
            />
            <div className="my-2 h-px bg-border" />
            <SummaryRow
              label="Balance due"
              value={formatMoney(invoice.balance_due)}
              bold
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variantClasses = {
    paid: "bg-primary text-primary-foreground",
    unpaid: "bg-destructive text-destructive-foreground",
    partially_paid: "border border-border text-foreground",
    draft: "bg-secondary text-secondary-foreground",
  } as const
  const cls = variantClasses[status] || variantClasses.draft
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${cls}`}
    >
      {status}
    </span>
  )
}

function SummaryRow({ label, value, bold = false, muted = false }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span
        className={`text-sm ${muted ? "text-muted-foreground" : "text-foreground"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${bold ? "font-semibold text-foreground" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  )
}
