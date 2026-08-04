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
import { NumberField } from "@/components/ui/form-fields"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

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
  onLiveChange,
  onLineItemAdded,
}: RoutePricingDialogProps) {
  const { data, isLoading } = useClientRoutingPricing(clientId)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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

  const [query, setQuery] = useState("")

  const filteredRoutes = useMemo(() => {
    return (data?.routes ?? []).filter((route) => {
      const q = query.toLowerCase()

      // if (tonnage) {
      //   tonnage &&
      //     route.pricings.find(
      //       (p) =>
      //         tonnage >= Number(p.min_tons) && tonnage <= Number(p.max_tons)
      //     )
      // }

      return (
        route.origin.toLowerCase().includes(q) ||
        route.destination.toLowerCase().includes(q)
      )
    })
  }, [query, data, tonnage])

  useEffect(() => {
    const unitPrice = routes.reduce(
      (curr, route) => curr + Number(route.pricing.price),
      0
    )
    const subtotal = unitPrice * quantity * (isRoundTrip ? 2 : 1)
    const lineTotal = subtotal
    form.setValue("unit_price", unitPrice)
    form.setValue("subtotal", subtotal)
    form.setValue("line_total", lineTotal)
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
        price: Number(pricing.price),
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

  const isSelected = (routeId: EntityId, pricingId: EntityId) =>
    routes.find((r) => r.route_id === routeId)?.pricing?.id === pricingId

  const totalSelected = useMemo(() => {
    return routes.filter((r) => r.pricing).length
  }, [routes])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-h-[90vh] flex-col overflow-hidden p-0 md:min-w-[90vw]">
        <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Location Pricing
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

        <div className="grid flex-1 overflow-hidden md:grid-cols-5">
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-4 overflow-y-auto border-r p-6 md:col-span-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <InputGroup className="flex-1">
                <InputGroupInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by origin or destination..."
                />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
              <Select items={data?.tonnages ?? []}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Filter by tonnage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {data?.tonnages?.map((item) => (
                      <SelectItem
                        key={item.min_tons}
                        value={item.min_tons.toString()}
                      >
                        {formatNumber(item.min_tons)} –{" "}
                        {formatNumber(item.max_tons)} TONS
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <NumberField
                className="w-32"
                control={form.control}
                name={"tonnage"}
              />
            </div>

            {isLoading && (
              <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
                Loading routes...
              </div>
            )}

            {!isLoading && filteredRoutes.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                <PackageOpen className="h-8 w-8" />
                <p className="text-sm">No routes match your search.</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {filteredRoutes.map((route) => (
                <Item
                  key={route.route_id}
                  variant="outline"
                  className="flex-col items-stretch gap-3 p-4"
                >
                  <ItemContent>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <ItemTitle className="text-base">
                        {route.origin}
                        <span className="mx-1.5 text-muted-foreground">→</span>
                        {route.destination}
                      </ItemTitle>
                    </div>

                    <ItemDescription>
                      {formatNumber(route.min_hrs)} –{" "}
                      {formatNumber(route.max_hrs)} hrs &nbsp;•&nbsp;{" "}
                      {formatNumber(route.distance_km)} km
                    </ItemDescription>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {route.pricings.map((pricing) => {
                        const active = isSelected(route.route_id, pricing.id)

                        return (
                          <Item
                            key={pricing.id}
                            variant={active ? "outline" : "muted"}
                            className={cn(
                              "cursor-pointer p-2.5 transition-colors hover:border-primary/60",
                              active && "border-primary bg-primary/5"
                            )}
                            onClick={() => handleSelectPricing(pricing, route)}
                          >
                            <ItemContent className="gap-0.5">
                              <ItemTitle
                                className={cn(
                                  "text-sm",
                                  active && "text-primary"
                                )}
                              >
                                {formatMoney(pricing.price)}
                              </ItemTitle>

                              <ItemDescription className="text-xs">
                                {formatNumber(pricing.min_tons)} –{" "}
                                {formatNumber(pricing.max_tons)} tons
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        )
                      })}
                    </div>
                  </ItemContent>
                </Item>
              ))}
            </div>
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
                {routes.map((r, routeIndex) => (
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
            <NumberField
              label="Unit Price"
              control={form.control}
              name="unit_price"
            />
            <NumberField
              required={false}
              label="Discount"
              control={form.control}
              name="discount"
            />
            <NumberField
              // readOnly
              required={false}
              label="Subtotal"
              control={form.control}
              name="subtotal"
            />
            <NumberField
              // readOnly
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
