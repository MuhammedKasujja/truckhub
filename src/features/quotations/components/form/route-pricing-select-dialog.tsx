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
import { useEffect, useMemo, useRef, useState } from "react"
import {
  createRouteQuotationLineItemSchema,
  Route,
  routePricingsSchema,
  RoutePricingStruct,
  RouteLineItemRequest,
} from "@/features/quotations/schemas"
import { Button } from "@/components/ui/button"
import { PackageOpen } from "lucide-react"
import z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { generateRouteEmptyLineItem } from "../../utils"
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
import { Card, CardContent } from "@/components/ui/card"
import { RouteSummary } from "./routes-dialog"

const formSchema = z.object({
  ...createRouteQuotationLineItemSchema.shape,
  routes: z.array(routePricingsSchema).min(1, "At least one route required"),
})

type FormValues = z.infer<typeof formSchema>

type RoutePricingDialogProps = {
  clientId: EntityId
  open: boolean
  selectedPricings: RoutePricingStruct[]
  onOpenChange: (v: boolean) => void
  lineItem?: RouteLineItemRequest
  onLineItemAdded: (lineItem: RouteLineItemRequest) => void
}

export function RoutePricingSelectDialog({
  clientId,
  open,
  selectedPricings,
  onOpenChange,
  lineItem,
  onLineItemAdded,
}: RoutePricingDialogProps) {
  const { data: clientPricings } = useClientRoutingPricing(clientId)
  const { data: companyPricings } = useRouteTonnagePricing()
  const pricingRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [route, setRoute] = useState<Route>()

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
          ...generateRouteEmptyLineItem(),
          routes: selectedPricings ?? [],
        },
    mode: "onChange",
  })

  const { watch } = form

  const routes = watch("routes")
  const quantity = watch("quantity")
  const isRoundTrip = watch("is_round_trip")
  const tonnage = watch("tonnage")
  const subtotal = watch("subtotal")
  const discount = watch("discount")
  const lineTotal = watch("line_total")
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
    const unitPrice = new Decimal(activePricing?.price ?? "0")
    const subtotal = unitPrice.times(quantity ?? "0").times(isRoundTrip ? 2 : 1)
    const lineTotal = subtotal
    form.setValue("unit_price", unitPrice.toString())
    form.setValue("subtotal", subtotal.toString())
    form.setValue("line_total", lineTotal.toString())
  }, [tonnage, routes, isRoundTrip, quantity])

  useEffect(() => {
    if (lineItem) {
      form.reset({ ...lineItem, routes: [] })
    }
  }, [lineItem, form])

  useEffect(() => {
    if (tonnage == null) return

    routes.forEach((route) => {
      const pricing = route.pricings.find(
        (p) => tonnage >= Number(p.minTons) && tonnage <= Number(p.maxTons)
      )

      if (!pricing) return

      const key = `${route.routeId}-${pricing.minTons}-${pricing.maxTons}`

      pricingRefs.current[key]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      })
    })
  }, [tonnage, routes])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[95vh] min-h-[95vh] overflow-hidden p-0 md:min-w-[95vw]">
        <form className="flex w-full flex-col">
          <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Route Pricing
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">
                Total - {formatMoney(lineTotal)}
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
                      <Checkbox
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        checked={field.value ?? false}
                        onCheckedChange={(state: boolean) =>
                          field.onChange(state)
                        }
                      />
                      <FieldLabel htmlFor={field.name} className="text-sm">
                        Round Trip
                      </FieldLabel>
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
                  Add to quote
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
            <div className="flex flex-col gap-3 overflow-y-auto md:col-span-2">
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                {selectedRoutes.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-center text-muted-foreground">
                    <PackageOpen className="h-6 w-6" />
                    <p className="text-sm">
                      Pick a price on the left to add a route here.
                    </p>
                  </div>
                )}
                {routes.map((r) => (
                  <div
                    key={r.routeId}
                    className="overflow-hidden rounded-lg border bg-background/20 p-3 shadow-sm"
                  >
                    <div className="min-w-0 space-y-2.5">
                      {/* Route header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 truncate text-lg font-medium">
                          {r.origin} → {r.destination}
                        </div>

                        <div className="shrink-0 text-sm text-muted-foreground">
                          {formatNumber(r.distanceKm)} km
                        </div>
                      </div>

                      {/* Pricing scroll area */}
                      <div className="min-w-0 overflow-x-auto pb-1">
                        <div className="flex w-max gap-2">
                          {r.pricings.map((p) => {
                            const key = `${r.routeId}-${p.minTons}-${p.maxTons}`

                            const isSelected =
                              tonnage != null &&
                              tonnage >= Number(p.minTons) &&
                              tonnage <= Number(p.maxTons)
                            return (
                              <div
                                key={key}
                                ref={(el) => {
                                  pricingRefs.current[key] = el
                                }}
                                className={cn(
                                  "flex min-w-[110px] shrink-0 flex-col items-center gap-1 rounded-lg border px-4 py-2 transition-all",
                                  isSelected &&
                                    "border-primary bg-primary/10 ring-2 ring-primary/30"
                                )}
                              >
                                <div className="text-xs text-muted-foreground">
                                  {p.minTons} – {p.maxTons} T
                                </div>

                                <div
                                  className={cn(
                                    "text-sm font-semibold whitespace-nowrap",
                                    isSelected && "text-primary"
                                  )}
                                >
                                  {formatMoney(p.price)}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Card>
                  <CardContent className="space-y-4">
                    <Field orientation={"horizontal"}>
                      <NumberField
                        required={false}
                        label="Tonnage"
                        control={form.control}
                        name="tonnage"
                      />
                      <NumberField
                        required={false}
                        label="Consumption (km/l)"
                        control={form.control}
                        name="estimated_consumption_rate_km"
                      />
                    </Field>
                    <Field orientation={"horizontal"} className="items-end">
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
                        required={false}
                        label="Quantity"
                        control={form.control}
                        name="quantity"
                      />
                    </Field>
                    <Field orientation={"horizontal"}>
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
                  </CardContent>
                </Card>
                <RouteSummary route={route} onEdit={setRoute} />
              </div>
              <div className="space-y-4 bg-card p-5 border-t">
                <Field orientation={"horizontal"}>
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
                </Field>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-muted-foreground">Subtotal</div>
                  <div className="text-sm">{formatMoney(subtotal)}</div>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-muted-foreground">Discount</div>
                  <div className="text-sm">
                    {discount ? -formatMoney(discount) : "__"}
                  </div>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="font-semibold">Line total</div>
                  <div className="text-xl font-bold text-primary">
                    {formatMoney(lineTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
