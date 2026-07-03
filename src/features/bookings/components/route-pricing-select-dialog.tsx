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
import { GripVertical } from "lucide-react"
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
      <DialogContent className="flex max-h-[90vh] min-h-[90vh] flex-col overflow-y-auto md:min-w-[90vw]">
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle>Location Pricing</DialogTitle>

          <DialogDescription className="flex items-center justify-between">
            <span>Select one pricing per route</span>

            <Button
              type="button"
              onClick={form.handleSubmit((data) => {
                onSelectedPricings(data.routes)
                onOpenChange(false)
              })}
            >
              Accept ({totalSelected})
            </Button>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-5">
          {/* LEFT SIDE */}
          <div className="space-y-4 md:col-span-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search routes..."
              type="search"
            />
            <Select items={data?.tonnages ?? []}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {" "}
                  {data?.tonnages?.map((item) => (
                    <SelectItem
                      key={item.min_tons}
                      value={item.min_tons.toString()}
                    >
                      {item.min_tons} - {item.max_tons} TONS
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {isLoading && <div>Loading...</div>}

            <div className="flex flex-col gap-4">
              {filteredRoutes.map((route) => (
                <Item key={route.route_id} variant="outline">
                  <ItemContent>
                    <ItemTitle>{route.destination}</ItemTitle>

                    <ItemDescription>
                      {route.min_hrs} - {route.max_hrs} hrs •{" "}
                      {route.distance_km} km
                    </ItemDescription>

                    <div className="flex flex-wrap gap-2">
                      {route.pricings.map((pricing) => {
                        const active = isSelected(route.route_id, pricing.id)

                        return (
                          <Item
                            key={pricing.id}
                            variant={active ? "outline" : "muted"}
                            className={cn(active && "border-primary")}
                            onClick={() => handleSelectPricing(pricing, route)}
                          >
                            <ItemContent>
                              <ItemTitle>
                                {formatPrice(pricing.price)}
                              </ItemTitle>

                              <ItemDescription>
                                {pricing.min_tons} - {pricing.max_tons} tons
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
          <div className="md:col-span-2">
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
                  <SortableItem key={r.route_id} value={r.route_id}>
                    <SortableItemHandle asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </SortableItemHandle>

                    <div className="font-medium">{r.destination}</div>
                    <div className="text-sm">
                      {r.pricing.min_tons} - {r.pricing.max_tons} tons •{" "}
                      {formatPrice(r.pricing.price)}
                    </div>
                    <Controller
                      name={`routes.${routeIndex}.pricing.price`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <div>Price</div>
                          <Input
                            {...field}
                            type={"text"}
                            id={field.name}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
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
                          <div>
                            Tons{" "}
                            <span className="text-[10px] text-muted-foreground">
                              ({r.pricing.min_tons}-{r.pricing.max_tons})
                            </span>
                          </div>
                          <Input
                            {...field}
                            type={"text"}
                            id={field.name}
                            aria-invalid={fieldState.invalid}
                            autoComplete="off"
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
