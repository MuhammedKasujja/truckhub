import { formatNumber } from "@/lib/format"
import { EntityId } from "@/schemas"
import { useEffect, useState } from "react"
import {
  createDistanceTonnageLineItemSchema,
  DistanceLineItemRequest,
  Route,
} from "@/features/quotations/schemas"
import { Button } from "@/components/ui/button"
import { Ruler, Weight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { generateDistanceEmptyLineItem } from "../../utils"
import {
  NumberField,
  MoneyField,
  SelectField,
  SwitchField,
} from "@/components/ui/form-fields"
import { useDistanceTonnagePricing } from "@/features/settings/pricing/hooks/use-distance-tonnage-pricing"
import { DistanceTonnagePricingItem } from "@/features/settings/pricing/types"
import { ENGINE_MODES } from "@/common/config"
import Decimal from "@/lib/decimal-config"
import { DistanceRatePricingTable } from "./distance-rates-pricing-table"
import { RouteSummary } from "./routes-dialog"
import {
  ConfigSection,
  LineItemDialog,
  LineTotals,
  PickHint,
  RoundTripField,
} from "./line-item-dialog"

const formSchema = z.object({
  ...createDistanceTonnageLineItemSchema.shape,
  // routes: z.array(routePricingsSchema).min(1, "At least one route required"),
})

type FormValues = z.infer<typeof formSchema>

type DistancePricingDialogProps = {
  clientId: EntityId
  open: boolean
  lineItem?: DistanceLineItemRequest
  onOpenChange: (v: boolean) => void
  onLineItemAdded: (lineItem: DistanceLineItemRequest) => void
}

export function DistancePricingSelectDialog({
  open,
  lineItem,
  onOpenChange,
  onLineItemAdded,
}: DistancePricingDialogProps) {
  const { data: response, isLoading } = useDistanceTonnagePricing()
  const [selectedDistanceRange, setSelectedDistanceRange] =
    useState<DistanceTonnagePricingItem>()
  const [route, setRoute] = useState<Route>()

  const data = response?.pricings ?? []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: lineItem
      ? { ...lineItem }
      : {
          ...generateDistanceEmptyLineItem(),
          // routes:  [],
        },
    mode: "onChange",
  })

  const { watch } = form

  const quantity = watch("quantity")
  const isRoundTrip = watch("is_round_trip")
  const tonnage = watch("tonnage")
  const distanceKm = watch("distance_km")
  const unitPrice = watch("unit_price")
  const subtotal = watch("subtotal")
  const discount = watch("discount")
  const lineTotal = watch("line_total")

  useEffect(() => {
    const subtotal = new Decimal(unitPrice ?? 0)
      .times(quantity ?? 0)
      .times(isRoundTrip ? 2 : 1)
    const lineTotal = subtotal.minus(discount ?? 0)
    form.setValue("subtotal", subtotal.toFixed(2))
    form.setValue("line_total", lineTotal.toFixed(2))
  }, [quantity, isRoundTrip, unitPrice, discount])

  function handleSelect(pricing: DistanceTonnagePricingItem) {
    setSelectedDistanceRange(pricing)
    form.setValue("unit_price", pricing.max_price)
    form.setValue("tonnage", pricing.tonnage_max)
    form.setValue(
      "distance_km",
      pricing.distance_max_km
        ? pricing.distance_max_km
        : pricing.distance_min_km
    )
  }

  useEffect(() => {
    if (!open) return
    if (lineItem) {
      form.reset({ ...lineItem })
      setRoute(lineItem.route)
    } else {
      form.reset({ ...generateDistanceEmptyLineItem() })
      setRoute(undefined)
    }
    setSelectedDistanceRange(undefined)
    // setRouteError(false)
  }, [open, lineItem])

  function handleSubmit() {
    form.handleSubmit((data) => {
      const title = `${data.distance_km} km`
      onLineItemAdded({ ...data, display_name: title })
      onOpenChange(false)
    })()
  }

  return (
    <LineItemDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Ruler}
      title="Distance haulage"
      description={
        distanceKm
          ? `${formatNumber(distanceKm)} km${tonnage ? ` · ${formatNumber(tonnage)} t` : ""}`
          : "Price by distance band and load."
      }
      isEditing={!!lineItem}
      lineTotal={lineTotal}
      onSubmit={handleSubmit}
      pickerTitle="Distance rate card"
      pickerDescription="Pick a band to prefill distance, tonnage and price. Rows and columns matching your figures are highlighted."
      picker={
        isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <DistanceRatePricingTable
            data={data}
            selectedId={selectedDistanceRange?.id}
            onSelect={handleSelect}
            distanceKm={distanceKm}
            loadTons={tonnage}
          />
        )
      }
      totals={
        <LineTotals
          subtotal={subtotal}
          discount={discount}
          lineTotal={lineTotal}
          isRoundTrip={isRoundTrip}
        >
          <div className="grid grid-cols-2 gap-3">
            <MoneyField
              label="Unit price"
              control={form.control}
              name="unit_price"
            />
            <MoneyField
              required={false}
              label="Discount"
              control={form.control}
              name="discount"
            />
          </div>
        </LineTotals>
      }
    >
      {selectedDistanceRange ? (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Ruler className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Selected rate
            </p>
            <p className="truncate text-sm font-semibold tabular-nums">
              {selectedDistanceRange.distance_min_km}–
              {selectedDistanceRange.distance_max_km} km ·{" "}
              {formatNumber(selectedDistanceRange.tonnage_min)}–
              {formatNumber(selectedDistanceRange.tonnage_max)} t
            </p>
          </div>
          <Button
            type="button"
            variant={"ghost"}
            size={"sm"}
            onClick={() => setSelectedDistanceRange(undefined)}
          >
            Clear
          </Button>
        </div>
      ) : (
        <PickHint
          icon={Ruler}
          title="No rate selected"
          description="Pick a band in the rate card, or type the figures below."
        />
      )}
      <ConfigSection icon={Weight} title="Trip & load">
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            required={false}
            label="Distance (km)"
            control={form.control}
            name={"distance_km"}
          />
          <NumberField
            required={false}
            label="Tonnage"
            control={form.control}
            name={"tonnage"}
          />
          <SelectField
            label={"Engine"}
            control={form.control}
            name={"engine_mode"}
            required={false}
            placeholder="Select engine"
            options={ENGINE_MODES.map((opt) => ({
              label: `${opt}`,
              value: `${opt}`,
            }))}
          />
          <NumberField
            label="Consumption (km/l)"
            control={form.control}
            name="estimated_consumption_rate_km"
          />
          <NumberField
            label="Quantity"
            control={form.control}
            name="quantity"
          />
        </div>
        <div className="grid gap-2">
          <SwitchField
            label={"With driver"}
            name={"with_driver"}
            control={form.control}
          />
          <SwitchField
            label={"With loaders"}
            name={"with_loaders"}
            control={form.control}
          />
        </div>
      </ConfigSection>
      <RoundTripField control={form.control} name="is_round_trip" />
      <RouteSummary
        route={route}
        onEdit={(r) => {
          form.setValue("route", r)
          setRoute(r)
        }}
      />
    </LineItemDialog>
  )
}
