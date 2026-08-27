import { Button } from "@/components/ui/button"
import { useCreateInvoice } from "@/features/invoices/hooks/use-edit-invoice"
import { QuotationPicker } from "@/features/quotations/components"
import { Quotation } from "@/features/quotations/types"
import { shipmentsActiveQueryOptions } from "@/features/shipments/query-options"
import { formatDate } from "@/lib/format"
import { EntityId } from "@/schemas"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/_admin/billing/invoices/new")({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useQuery(
    shipmentsActiveQueryOptions({ page: 1, perPage: 20, sort: [] })
  )
  const [quotation, setQuotation] = useState<Quotation | null>()
  const [lineItems, setLineItems] = useState<EntityId[]>([])
  const { createInvoice } = useCreateInvoice()
  return (
    <div className="space-y-5">
      <div className="flex w-full gap-5">
        <QuotationPicker
          value={quotation}
          onChange={(quotation) => {
            setQuotation(quotation)
          }}
        />
      </div>
      <Button
        onClick={() => {
          if (quotation)
            createInvoice({
              quotationId: quotation?.id,
              unitIds: lineItems,
              dueDate: "30/01/2026",
            })
        }}
      >
        Create
      </Button>
      {data?.data.map((trip) => (
        <div
          key={trip.id}
          className="flex gap-4"
          onClick={() => {
            setLineItems((prev) => [...prev, trip.id])
          }}
        >
          <div>{trip.number}</div>
          <div>{formatDate(trip.actual_start)}</div>
          <div>{trip.actual_end ? formatDate(trip.actual_end) : "-"}</div>
          <div>{trip.status}</div>
        </div>
      ))}
    </div>
  )
}
