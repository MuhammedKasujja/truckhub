import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/form-fields"
import { useCreateInvoice } from "@/features/invoices/hooks/use-edit-invoice"
import { QuotationPicker } from "@/features/quotations/components"
import { useQuotationCompletedShipments } from "@/features/quotations/hooks/use-quotation-shipments"
import { Quotation } from "@/features/quotations/types"
import { formatDate } from "@/lib/format"
import { EntityId } from "@/schemas"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/_admin/billing/invoices/new")({
  component: RouteComponent,
})

function RouteComponent() {
  const [quotation, setQuotation] = useState<Quotation | null>()

  const { data } = useQuotationCompletedShipments(quotation?.id)

  const [dueDate, setDueDate] = useState<Date | null>()
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
      <DatePicker onDateChanged={setDueDate} />
      <Button
        onClick={() => {
          if (quotation && dueDate)
            createInvoice({
              quotationId: quotation?.id,
              unitIds: lineItems,
              dueDate: dueDate.toLocaleDateString("en-CA"),
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
