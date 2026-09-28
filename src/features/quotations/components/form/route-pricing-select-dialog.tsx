import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { useClientRoutingPricing } from "@/features/clients/hooks/use-client-route-pricing"
import { TonnagePricing } from "@/features/settings/pricing"
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
import { GripVertical, MapPin, Search, PackageOpen } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ENGINE_MODES } from "@/common/config"
import Decimal from "@/lib/decimal-config"
import { useRouteTonnagePricing } from "@/features/settings/pricing/hooks/use-distance-tonnage-pricing"
import { RouteTonnagePricingGrid } from "@/features/settings/pricing/components/route-pricing/route-tonnage-pricing"
import { RoutePricingRow } from "@/features/settings/pricing/schemas"

const formSchema = z.object({
  ...createTruckQuotationLineItemSchema.shape,
  routes: z.array(routePricingsSchema).min(1, "At least one route required"),
})

type FormValues = z.infer<typeof formSchema>

type RoutePricingDialogProps = {
  clientId: EntityId
  open: boolean
  selectedPricings: RoutePricingStruct[]
  onOpenChange: (v: boolean) => void
  lineItem?: TruckLineItemRequest
  onLiveChange?: (route: RoutePricingStruct) => void
  onLineItemAdded: (lineItem: TruckLineItemRequest) => void
}

type RouteDetails = {
  route_id: EntityId
  origin: string
  destination: string
  distance_km: string | number
  min_hrs: string | number
  max_hrs: string | number
}
export function RoutePricingSelectDialog({
  clientId,
  open,
  selectedPricings,
  onOpenChange,
  lineItem,
  onLiveChange,
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

  const serviceLocationsFields = useFieldArray({
    control: form.control,
    name: "locations",
  })

  const routes = watch("routes")
  const quantity = watch("quantity")
  const isRoundTrip = watch("is_round_trip")
  const tonnage = watch("tonnage")
  const [selectedRoutes, setSelectedRoutes] = useState<RoutePricingRow[]>([])

  const [query, setQuery] = useState("")

  useEffect(() => {
    const unitPrice = routes.reduce(
      (curr, route) => curr.plus(route.pricing.price ?? 0),
      new Decimal("0")
    )
    const subtotal = unitPrice.times(quantity).times(isRoundTrip ? 2 : 1)
    const lineTotal = subtotal
    form.setValue("unit_price", unitPrice.toString())
    form.setValue("subtotal", subtotal.toString())
    form.setValue("line_total", lineTotal.toString())
  }, [routes, quantity, isRoundTrip])

  function handleSelectPricing(pricing: TonnagePricing, route: RouteDetails) {
    const updated: RoutePricingStruct = {
      tempId: route.route_id,
      route_id: route.route_id,
      origin: route.origin,
      destination: route.destination,
      distance_km: route.distance_km,
      min_hrs: route.min_hrs,
      max_hrs: route.max_hrs,
      pricing: {
        id: pricing.id,
        min_tons: Number(pricing.min_tons),
        max_tons: Number(pricing.max_tons),
        price: pricing.price,
      },
    }

    const current = form.getValues("routes")

    const exists = current.find((r) => r.route_id === route.route_id)

    let next: RoutePricingStruct[]

    // ➜ add
    if (!exists) {
      next = [...current, updated]
    }
    // ➜ toggle off (remove route)
    else if (exists.pricing.id === pricing.id) {
      next = current.filter((r) => r.route_id !== route.route_id)
    }
    // ➜ replace
    else {
      next = current.map((r) => (r.route_id === route.route_id ? updated : r))
    }

    form.setValue("routes", next, {
      shouldDirty: true,
      shouldValidate: true,
    })
    serviceLocationsFields.append({
      ...route,
      price: Number(pricing.price),
      pricing_id: pricing.id,
      max_tons: Number(pricing.max_tons),
      min_tons: Number(pricing.min_tons),
    })

    // 🔥 LIVE SYNC to MAIN FORM
    onLiveChange?.(updated)
  }


  const totalSelected = useMemo(() => {
    return routes.filter((r) => r.pricing).length
  }, [routes])

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
              Destinations - {serviceLocationsFields.fields.length}
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
                onClick={form.handleSubmit((data) => {
                  const { routes: _, ...rest } = data
                  onLineItemAdded(rest)
                  onOpenChange(false)
                })}
              >
                Accept
                <span
                  className={cn(
                    "ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                    "bg-primary-foreground/20"
                  )}
                >
                  {totalSelected}
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
                {routes.length} added
              </span>
            </div>

            {routes.length === 0 && (
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
              getItemValue={(item) => item.route_id}
            >
              <SortableContent className="flex flex-col gap-2">
                {routes.map((r) => (
                  <SortableItem
                    key={r.route_id}
                    value={r.route_id}
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
                    <div className="flex items-center gap-2">
                      <div className="leading-tight font-medium">
                        {r.destination}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(r.distance_km)} km &nbsp;•&nbsp;{" "}
                        {formatMoney(r.pricing.price)}
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
