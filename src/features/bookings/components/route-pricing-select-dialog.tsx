import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useEffect, useMemo, useState } from "react"
import { RoutePricingStruct } from "../schemas"
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

type RoutePricingDialogProps = {
  clientId: EntityId
  open: boolean
  selectedPricings: RoutePricingStruct[]
  onOpenChange: (v: boolean) => void
  onSelectedPricings: (pricings: RoutePricingStruct[]) => void
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
}: RoutePricingDialogProps) {
  const { data, isLoading } = useClientRoutingPricing(clientId)

  const [routesMap, setRoutesMap] =
    useState<RoutePricingStruct[]>(selectedPricings)

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
  useEffect(() => {
    setRoutesMap(selectedPricings)
  }, [clientId, selectedPricings])

  // ✅ SINGLE pricing select per route
  function handleSelectPricing(pricing: TonnagePricing, route: RouteDetails) {
    setRoutesMap((prev) => {
      const existing = prev.find((r) => r.route_id === route.route_id)

      // ➜ route does not exist → create it
      if (!existing) {
        return [
          ...prev,
          {
            tempId: route.route_id,
            route_id: route.route_id,
            origin: route.origin,
            destination: route.destination,
            distance_km: route.distance_km,
            min_hrs: route.min_hrs,
            max_hrs: route.max_hrs,
            pricing: {
              ...pricing,
              tons: "",
              default_price: pricing.price,
            },
          },
        ]
      }

      const isSamePricing = existing.pricing.id === pricing.id

      // ❌ toggle off → REMOVE ROUTE COMPLETELY
      if (isSamePricing) {
        return prev.filter((r) => r.route_id !== route.route_id)
      }

      // ✔ replace pricing
      return prev.map((r) => {
        if (r.route_id !== route.route_id) return r

        return {
          ...r,
          pricing: {
            ...pricing,
            tons: "",
            default_price: pricing.price,
          },
        }
      })
    })
  }

  const isSelected = (routeId: EntityId, pricingId: EntityId) =>
    routesMap.find((r) => r.route_id === routeId)?.pricing?.id === pricingId

  const totalSelected = useMemo(() => {
    return routesMap.filter((r) => r.pricing).length
  }, [routesMap])

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
              onClick={() => {
                onSelectedPricings(routesMap)
                onOpenChange(false)
              }}
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
              value={routesMap}
              onValueChange={setRoutesMap}
              getItemValue={(item) => item.route_id}
            >
              <SortableContent className="flex flex-col gap-2">
                {routesMap.map((r) => (
                  <SortableItem key={r.route_id} value={r.route_id}>
                    <SortableItemHandle asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <GripVertical className="h-4 w-4" />
                      </Button>
                    </SortableItemHandle>

                    <div className="font-medium">{r.destination}</div>

                    {r.pricing ? (
                      <div className="text-sm">
                        {r.pricing.min_tons} - {r.pricing.max_tons} tons •{" "}
                        {formatPrice(r.pricing.price)}
                      </div>
                    ) : (
                      <div className="text-sm text-muted">
                        No pricing selected
                      </div>
                    )}
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
