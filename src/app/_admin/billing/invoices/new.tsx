import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/form-fields"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Label } from "@/components/ui/label"
import { useCreateInvoice } from "@/features/invoices/hooks/use-edit-invoice"
import { QuotationPicker } from "@/features/quotations/components"
import { useQuotationCompletedShipments } from "@/features/quotations/hooks/use-quotation-shipments"
import { Quotation } from "@/features/quotations/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { EntityId } from "@/schemas"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/_admin/billing/invoices/new")({
  component: RouteComponent,
})

function RouteComponent() {
  const [quotation, setQuotation] = useState<Quotation | null>()

  const { data: shipments } = useQuotationCompletedShipments(quotation?.id)

  const [dueDate, setDueDate] = useState<Date | null>()
  const [lineItemsIds, setLineItems] = useState<EntityId[]>([])
  const { createInvoice } = useCreateInvoice()

  function onItemSelected(itemId: EntityId) {
    setLineItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((ele) => ele !== itemId)
      }
      return [...prev, itemId]
    })
  }

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
      {quotation && (
        <Item variant={"muted"}>
          <ItemContent>
            <ItemTitle>{quotation.client.name}</ItemTitle>
            <ItemDescription>{quotation.client.number}</ItemDescription>
          </ItemContent>
        </Item>
      )}
      <Label htmlFor="due-date">Due Date</Label>
      <DatePicker id="due-date" onDateChanged={setDueDate} />
      <Button
        onClick={() => {
          if (quotation && dueDate)
            createInvoice({
              quotationId: quotation?.id,
              unitIds: lineItemsIds,
              dueDate: dueDate.toLocaleDateString("en-CA"),
            })
        }}
      >
        Create
      </Button>
      {shipments?.map((trip) => (
        <Item
          key={trip.id}
          className={cn("flex w-full cursor-pointer gap-4")}
          variant={lineItemsIds.includes(trip.id) ? "muted" : "outline"}
          onClick={() => onItemSelected(trip.id)}
        >
          <ItemContent>
            <ItemTitle>{trip.number}</ItemTitle>
            <ItemDescription className="flex gap-4">
              <div>{formatDate(trip.actual_start)}</div>
              <div>{trip.actual_end ? formatDate(trip.actual_end) : "-"}</div>
              <div>{trip.item.subtotal}</div>
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </div>
  )
}
