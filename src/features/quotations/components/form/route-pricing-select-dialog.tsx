import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useClientRoutingPricing } from "@/features/clients/hooks/use-client-route-pricing"
import { formatMoney, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { EntityId } from "@/schemas"
import { useEffect, useMemo, useState } from "react"
import {
  createTruckQuotationLineItemSchema,
  routePricingsSchema,
  RoutePricingStruct,
  TruckLineItemRequest,
} from "@/features/quotations/schemas"
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable"
import { Button } from "@/components/ui/button"
import { GripVertical, PackageOpen } from "lucide-react"
import z from "zod"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { generateTruckEmptyLineItem } from "../../utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  MoneyField,
  NumberField,
  SelectField,
  SwitchField,
} from "@/components/ui/form-fields"
import { ENGINE_MODES } from "@/common/config"
import { useRouteTonnagePricing } from "@/features/settings/pricing/hooks/use-distance-tonnage-pricing"
import { RouteTonnagePricingGrid } from "@/features/settings/pricing/components/route-pricing/route-tonnage-pricing"
import { RoutePricingRow } from "@/features/settings/pricing/schemas"
import Decimal from "decimal.js"

const formSchema = z.object({
  ...createTruckQuotationLineItemSchema.shape,
  routes: z.array(routePricingsSchema).min(1, "At least one route required"),
})

type RoutePricing = RoutePricingRow & { tempId: string }

type FormValues = z.infer<typeof formSchema>

type RoutePricingDialogProps = {
  clientId: EntityId
  open: boolean
  selectedPricings: RoutePricingStruct[]
  onOpenChange: (v: boolean) => void
  lineItem?: TruckLineItemRequest
  onLineItemAdded: (lineItem: TruckLineItemRequest) => void
}

export function RoutePricingSelectDialog({
  clientId,
  open,
  selectedPricings,
  onOpenChange,
  lineItem,
  onLineItemAdded,
}: RoutePricingDialogProps) {
  const { data: clientPricings, isLoading } = useClientRoutingPricing(clientId)
  const { data: companyPricings } = useRouteTonnagePricing()

  const pricings = useMemo(() => {
    // if (isFetching) return undefined

    if (clientPricings) return clientPricings

    return companyPricings
  }, [clientPricings, companyPricings])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: lineItem
      ? { ...lineItem, routes: selectedPricings ?? [] }
      : {
          ...generateTruckEmptyLineItem(),
          routes: selectedPricings ?? [],
        },
    mode: "onChange",
  })

  const { watch } = form

  const routes = watch("routes")
  const quantity = watch("quantity")
  const isRoundTrip = watch("is_round_trip")
  const tonnage = watch("tonnage")
  const [selectedRoutes, setSelectedRoutes] = useState<RoutePricingRow[]>([])

  useEffect(() => {
    form.setValue(
      "routes",
      selectedRoutes.map((r) => ({ ...r, tempId: r.routeId }))
    )
    const locations = selectedRoutes.map((route) => ({
      route_id: route.routeId,
      origin: route.origin,
      destination: route.destination,
      price: 600,
      min_tons: 6,
      max_tons: 6,
    }))
    form.setValue("locations", locations)
  }, [selectedRoutes])

  useEffect(() => {
    const pricings = routes.map((r) => r.pricings).flat()
    const activePricing = pricings.find(
      (p) => tonnage <= Number(p.maxTons) && tonnage >= Number(p.minTons)
    )
    const unitPrice = new Decimal(activePricing?.price?? "0")
    const subtotal = unitPrice.times(quantity??"0").times(isRoundTrip ? 2 : 1)
    const lineTotal = subtotal
    form.setValue("unit_price", unitPrice.toString())
    form.setValue("subtotal", subtotal.toString())
    form.setValue("line_total", lineTotal.toString())

  }, [tonnage, routes, isRoundTrip, quantity])

  // useEffect(() => {
  //   const unitPrice = routes.reduce(
  //     (curr, route) => curr.plus(route.pricing.price ?? 0),
  //     new Decimal("0")
  //   )
  //   const subtotal = unitPrice.times(quantity).times(isRoundTrip ? 2 : 1)
  //   const lineTotal = subtotal
  //   form.setValue("unit_price", unitPrice.toString())
  //   form.setValue("subtotal", subtotal.toString())
  //   form.setValue("line_total", lineTotal.toString())
  // }, [routes, quantity, isRoundTrip])

  useEffect(() => {
    if (lineItem) {
      form.reset({ ...lineItem, routes: [] })
    }
  }, [lineItem, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95vh] min-h-[95vh] flex-col overflow-hidden p-0 md:min-w-[95vw]">
        <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Route Pricing
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Destinations - {selectedRoutes.length}
            </span>
            <div className="flex gap-4">
              <Controller
                name={`is_round_trip`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    orientation={"horizontal"}
                    className="gap-2"
                  >
                    <FieldLabel htmlFor={field.name} className="text-sm">
                      Round Trip
                    </FieldLabel>
                    <Checkbox
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      checked={field.value ?? false}
                      onCheckedChange={(state: boolean) =>
                        field.onChange(state)
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError
                        className="text-xs"
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />

              <Button
                type="button"
                className="shrink-0"
                onClick={form.handleSubmit(
                  (data) => {
                    const { routes: _, ...rest } = data
                    onLineItemAdded(rest)
                    onOpenChange(false)
                  },
                  (errors) => {
                    console.log("Form Errors", errors)
                  }
                )}
              >
                Accept
                <span
                  className={cn(
                    "ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                    "bg-primary-foreground/20"
                  )}
                >
                  {selectedRoutes.length}
                </span>
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid flex-1 overflow-hidden md:grid-cols-6">
          {/* LEFT SIDE */}
          <div className="overflow-y-auto border-r p-6 md:col-span-4">
            <RouteTonnagePricingGrid
              isSelectable
              routes={pricings?.routes ?? []}
              effectiveDate={
                pricings?.effective_date ?? new Date().toDateString()
              }
              title="Company Pricing"
              onRowSelect={setSelectedRoutes}
            />
          </div>

          {/* RIGHT SIDE (SORTABLE) */}
          <div className="flex flex-col gap-3 overflow-y-auto p-6 md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">
                Selected routes
              </h3>
              <span className="text-xs text-muted-foreground">
                {selectedRoutes.length} added
              </span>
            </div>

            {selectedRoutes.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-12 text-center text-muted-foreground">
                <PackageOpen className="h-6 w-6" />
                <p className="text-sm">
                  Pick a price on the left to add a route here.
                </p>
              </div>
            )}

            <Sortable
              value={routes}
              onValueChange={(updated) =>
                form.setValue("routes", updated, {
                  shouldDirty: true,
                })
              }
              getItemValue={(item) => item.routeId}
            >
              <SortableContent className="flex flex-col gap-2">
                {routes.map((r) => (
                  <SortableItem
                    key={r.routeId}
                    value={r.routeId}
                    className="flex items-start gap-2 rounded-lg border bg-background/20 p-3 shadow-sm"
                  >
                    <SortableItemHandle asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-1 size-8 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </SortableItemHandle>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="leading-tight font-medium">
                          {r.origin} -- {r.destination}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatNumber(r.distanceKm)} km &nbsp;•&nbsp;{" "}
                          {/* {formatMoney(r.pricing.price)} */}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {r.pricings.map((p) => (
                          <p key={p.price} className="text-xs">
                            {p.minTons} - {p.maxTons} T ||{" "}
                            {formatMoney(p.price)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContent>
            </Sortable>
            <Field orientation={"horizontal"} className="items-end">
              <SelectField
                label={"Engine"}
                control={form.control}
                name={"engine_mode"}
                placeholder="Select engine"
                options={ENGINE_MODES.map((opt) => ({
                  label: `${opt}`,
                  value: `${opt}`,
                }))}
              />
              <SwitchField
                label={"Driver"}
                name={"with_driver"}
                control={form.control}
              />
              <SwitchField
                label={"Loaders"}
                name={"with_loaders"}
                control={form.control}
              />
            </Field>
            <NumberField
              label="Tonnage"
              control={form.control}
              name="tonnage"
            />
            <NumberField
              label="Consumption Rate (km/l)"
              control={form.control}
              name="estimated_consumption_rate_km"
            />
            <NumberField
              label="quantity"
              control={form.control}
              name="quantity"
            />
            <MoneyField
              label="Unit Price"
              control={form.control}
              name="unit_price"
            />
            <MoneyField
              required={false}
              label="Discount"
              control={form.control}
              name="discount"
            />
            <MoneyField
              readOnly
              required={false}
              label="Subtotal"
              control={form.control}
              name="subtotal"
            />
            <MoneyField
              readOnly
              required={false}
              label="Line total"
              control={form.control}
              name="line_total"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
