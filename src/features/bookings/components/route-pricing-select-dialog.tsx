import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { useClientRoutingPricing } from "@/features/clients/hooks/use-client-route-pricing"
import { TonnagePricing } from "@/features/settings/pricing"
import { formatPrice } from "@/lib/format"
import { cn } from "@/lib/utils"
import { EntityId } from "@/schemas"
import { useMemo, useState } from "react"
import { routePricingsSchema, RoutePricingStruct } from "../schemas"
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
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError } from "@/components/ui/field"

const formSchema = z.object({
  routes: z.array(routePricingsSchema).min(1, "At least one route required"),
})

type FormValues = z.infer<typeof formSchema>

type RoutePricingDialogProps = {
  clientId: EntityId
  open: boolean
  selectedPricings: RoutePricingStruct[]
  onOpenChange: (v: boolean) => void
  onSelectedPricings: (pricings: RoutePricingStruct[]) => void
  onLiveChange?: (route: RoutePricingStruct) => void
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
  onSelectedPricings,
  onLiveChange,
}: RoutePricingDialogProps) {
  const { data, isLoading } = useClientRoutingPricing(clientId)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      routes: selectedPricings ?? [],
    },
    mode: "onChange",
  })

  const { watch } = form

  const routes = watch("routes")

  const [query, setQuery] = useState("")

  const filteredRoutes = useMemo(() => {
    return (data?.routes ?? []).filter((route) => {
      const q = query.toLowerCase()

      return (
        route.origin.toLowerCase().includes(q) ||
        route.destination.toLowerCase().includes(q)
      )
    })
  }, [query, data])

  // reset when client changes
  // useEffect(() => {
  //   setRoutesMap(selectedPricings)
  // }, [clientId, selectedPricings])

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
        tons: "",
        default_price: pricing.price,
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
        {/* HEADER */}
        <DialogHeader className="border-b bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Location Pricing
          </DialogTitle>

          <DialogDescription className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              Select one pricing per route
            </span>

            <Button
              type="button"
              className="shrink-0"
              onClick={form.handleSubmit((data) => {
                onSelectedPricings(data.routes)
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
          </DialogDescription>
        </DialogHeader>

        <div className="grid flex-1 overflow-hidden md:grid-cols-5">
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-4 overflow-y-auto border-r p-6 md:col-span-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search routes by origin or destination..."
                  type="search"
                  className="pl-9"
                />
              </div>

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
                        {item.min_tons} – {item.max_tons} TONS
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
                      {route.min_hrs}–{route.max_hrs} hrs &nbsp;•&nbsp;{" "}
                      {route.distance_km} km
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
                                {formatPrice(pricing.price)}
                              </ItemTitle>

                              <ItemDescription className="text-xs">
                                {pricing.min_tons}–{pricing.max_tons} tons
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

                    <div className="flex flex-1 flex-col gap-2">
                      <div>
                        <div className="leading-tight font-medium">
                          {r.destination}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {r.pricing.min_tons}–{r.pricing.max_tons} tons
                          &nbsp;•&nbsp; {formatPrice(r.pricing.price)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Controller
                          name={`routes.${routeIndex}.pricing.price`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <div className="text-xs text-muted-foreground">
                                Price
                              </div>
                              <Input
                                {...field}
                                type={"text"}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                                className="h-8"
                              />
                              {fieldState.invalid && (
                                <FieldError
                                  className="text-[10px]"
                                  errors={[fieldState.error]}
                                />
                              )}
                            </Field>
                          )}
                        />
                        <Controller
                          name={`routes.${routeIndex}.pricing.tons`}
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <div className="text-xs text-muted-foreground">
                                Tons{" "}
                                <span className="text-[10px]">
                                  ({r.pricing.min_tons}-{r.pricing.max_tons})
                                </span>
                              </div>
                              <Input
                                {...field}
                                type={"text"}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                                className="h-8"
                              />
                              {fieldState.invalid && (
                                <FieldError
                                  className="text-[10px]"
                                  errors={[fieldState.error]}
                                />
                              )}
                            </Field>
                          )}
                        />
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContent>
            </Sortable>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
