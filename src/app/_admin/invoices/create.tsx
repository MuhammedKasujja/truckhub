import {
  PageAction,
  PageBackButton,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/form-fields"
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "@/components/ui/item"
import { useCreateInvoice } from "@/features/invoices/hooks/use-edit-invoice"
import { QuotationPicker } from "@/features/quotations/components"
import { useQuotationCompletedShipments } from "@/features/quotations/hooks/use-quotation-shipments"
import { Quotation } from "@/features/quotations/types"
import { useCompanyLoadingFees } from "@/features/settings/pricing/hooks/use-loading-offloading-pricing"
import { formatDate, formatMoney, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { EntityId } from "@/schemas"
import { createFileRoute } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { DataList } from "@/components/ui/data-list"
import { Separator } from "@/components/ui/separator"
import { useDefaultTaxRate } from "@/features/settings/tax-rates/hooks/use-tax-rates"
import Decimal from "decimal.js"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
} from "@/components/ui/frame"

export const Route = createFileRoute("/_admin/invoices/create")({
  component: RouteComponent,
})

function RouteComponent() {
  const [quotation, setQuotation] = useState<Quotation | null>()

  const { data: shipments } = useQuotationCompletedShipments(quotation?.id)

  const { data: loadingFees } = useCompanyLoadingFees()

  const defaultTaxRate = useDefaultTaxRate()

  const [dueDate, setDueDate] = useState<Date | null>()
  const [lineItemsIds, setLineItems] = useState<EntityId[]>([])
  const { createInvoice, isPending } = useCreateInvoice()

  useEffect(() => {
    setLineItems([])
  }, [quotation])

  const lineItems = useMemo(() => {
    return shipments?.filter((shp) => lineItemsIds.includes(shp.id)) ?? []
  }, [lineItemsIds])

  const subtotal = useMemo(() => {
    return lineItems.reduce((curr, item) => {
      const days = item.consumption?.days ?? 1
      const total = new Decimal(item.item.unit_price ?? "").times(
        days === 0 ? 1 : days
      )
      return total.plus(curr)
    }, new Decimal(0))
  }, [lineItems])

  const fuelPrice = useMemo(() => {
    return lineItems.reduce((curr, item) => {
      const total = new Decimal(item.consumption?.fuel_rate ?? 0)
      return total.plus(curr)
    }, new Decimal(0))
  }, [lineItems])

  const taxAmount = useMemo(() => {
    const taxRate = (defaultTaxRate?.rate ?? 0) / 100
    return subtotal.times(taxRate)
  }, [subtotal])

  const grandTotal = useMemo(() => {
    return subtotal.plus(taxAmount).plus(fuelPrice)
  }, [subtotal, taxAmount, fuelPrice])

  function onItemSelected(itemId: EntityId) {
    setLineItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((ele) => ele !== itemId)
      }
      return [...prev, itemId]
    })
  }

  function handleCreateInvoice() {
    if (!quotation) {
      toast.error("Please select a quotation")
      return
    }
    if (!dueDate) {
      toast.error("Due date is required")
      return
    }

    if (lineItemsIds.length < 1) {
      toast.error("Please select at least one line item")
      return
    }

    createInvoice({
      quotationId: quotation?.id,
      unitIds: lineItemsIds,
      dueDate: dueDate.toLocaleDateString("en-CA"),
    })
  }

  return (
    <>
      <PageHeader className="">
        <PageTitle>New Invoice</PageTitle>
        <PageAction className="flex gap-2">
          <PageBackButton text="Cancel" />
          <Button onClick={handleCreateInvoice} disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}Save
            Invoice
          </Button>
        </PageAction>
      </PageHeader>
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <Frame>
              <FramePanel>
                <Field>
                  <FieldLabel htmlFor="quotation">Quotation</FieldLabel>
                  <FieldContent>
                    <QuotationPicker
                      id="quotation"
                      value={quotation}
                      onChange={(quotation) => {
                        setQuotation(quotation)
                      }}
                    />
                  </FieldContent>
                </Field>
              </FramePanel>
            </Frame>
            {quotation && (
              <Frame>
                <FrameHeader>
                  <FrameDescription>Bill to</FrameDescription>
                </FrameHeader>
                <FramePanel>
                  {/* <Item variant={"default"}> */}
                    <ItemContent>
                      <ItemTitle>
                        {quotation.client.name} - {quotation.client.number}
                      </ItemTitle>
                      <ItemDescription>
                        {quotation.client.phone}
                      </ItemDescription>
                      <ItemDescription>
                        {quotation.client.email}
                      </ItemDescription>
                    </ItemContent>
                  {/* </Item> */}
                </FramePanel>
              </Frame>
            )}
          </div>
          <div className="md:col-span-2">
            <Frame>
              <FramePanel>
                <Field>
                  <FieldLabel htmlFor="due-date">Due Date</FieldLabel>
                  <FieldContent>
                    <DatePicker id="due-date" onDateChanged={setDueDate} />
                  </FieldContent>
                </Field>
              </FramePanel>
            </Frame>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4 md:grid-cols-6">
          <Frame className="md:col-span-4">
            <FrameHeader>
              <FrameDescription>Line items</FrameDescription>
            </FrameHeader>
            <FramePanel className="space-y-4">
              {shipments?.map((trip) => (
                <Item
                  key={trip.id}
                  className={cn(
                    "flex w-full cursor-pointer",
                    lineItemsIds.includes(trip.id) && "ring ring-primary"
                  )}
                  variant={lineItemsIds.includes(trip.id) ? "muted" : "outline"}
                  onClick={() => onItemSelected(trip.id)}
                >
                  <ItemContent>
                    <ItemTitle>{trip.number}</ItemTitle>
                    <ItemDescription className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div>Started</div>
                        <div className="text-foreground">
                          {formatDate(trip.actual_start)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>Ended</div>
                        <div className="text-foreground">
                          {trip.actual_end ? formatDate(trip.actual_end) : "-"}
                        </div>
                      </div>
                      {trip.item.tonnage && (
                        <div className="space-y-2">
                          <div>Tonnage</div>
                          <div className="text-foreground">
                            {formatNumber(trip.item.tonnage)}
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <div>Distance (km)</div>
                        <div className="text-foreground">
                          {trip.consumption?.distance_km ?? "-"}
                        </div>
                      </div>
                    </ItemDescription>
                    <Separator />
                    <ItemDescription className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div>Contact name</div>
                        <div className="text-foreground">
                          {trip.contact_name ?? "-"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>Start Mileage</div>
                        <div className="text-foreground">
                          {trip.consumption?.start_mileage ?? "-"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>End Mileage</div>
                        <div className="text-foreground">
                          {trip.consumption?.end_mileage ?? "-"}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>Consumption Rate</div>
                        <div className="text-foreground">
                          {trip.vehicle?.fuel_consumption_rate ?? "-"}
                        </div>
                      </div>
                    </ItemDescription>
                    <Separator />
                    <ItemDescription className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div>Fuel Rate</div>
                        <div className="text-foreground">
                          {formatMoney(trip.consumption?.fuel_rate)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>Cost (days * price)</div>
                        <div className="text-foreground">
                          {formatMoney(trip.item.unit_price)}
                        </div>
                      </div>
                      {trip.item.with_loaders && (
                        <div className="space-y-2">
                          <div>Loading Fees</div>
                          <div className="text-foreground">
                            {formatMoney(trip.item.unit_price)}
                          </div>
                        </div>
                      )}
                      {trip.item.with_loaders && (
                        <div className="space-y-2">
                          <div>Offloading Fees</div>
                          <div className="text-foreground">
                            {formatMoney(trip.item.unit_price)}
                          </div>
                        </div>
                      )}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </FramePanel>
          </Frame>
          <div className="md:col-span-2">
            <Card>
              <CardContent>
                <DataList>
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-2">
                      <div className="text-muted-foreground">{item.number}</div>
                      <div className="text-foreground">
                        {formatMoney(item.item.unit_price)}
                      </div>
                    </div>
                  ))}
                </DataList>
                <Separator />
                <div className="flex justify-between py-2">
                  <div className="text-muted-foreground">Sub total</div>
                  <div className="text-foreground">
                    {formatMoney(subtotal.toString())}
                  </div>
                </div>
                {defaultTaxRate && (
                  <div className="flex justify-between py-2">
                    <div className="text-muted-foreground">
                      Vat({defaultTaxRate?.rate}%)
                    </div>
                    <div className="text-foreground">
                      {formatMoney(taxAmount.toString())}
                    </div>
                  </div>
                )}
                {fuelPrice && (
                  <div className="flex justify-between py-2">
                    <div className="text-muted-foreground">Fuel Rate</div>
                    <div className="text-foreground">
                      {formatMoney(fuelPrice.toString())}
                    </div>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between py-2">
                  <div className="font-medium text-muted-foreground">
                    Grand Total
                  </div>
                  <div className="text-xl font-semibold text-foreground">
                    {formatMoney(grandTotal.toString())}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
