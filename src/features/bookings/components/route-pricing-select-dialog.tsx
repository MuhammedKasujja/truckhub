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
  const [pricingsMap, setPricingsMap] =
    useState<RoutePricingStruct[]>(selectedPricings)
  const [pricings, setPricings] =
    useState<RoutePricingStruct[]>(selectedPricings)
  const [query, setQuery] = useState("")

  // useEffect(() => {
  //   setPricingsMap(data?.routes ?? [])
  // }, [data])

  const filteredRoutes = useMemo(() => {
    return (data?.routes ?? []).filter((route) => {
      const q = query.toLowerCase()

      return (
        route.origin.toLowerCase().includes(q) ||
        route.destination.toLowerCase().includes(q)
      )
    })
  }, [query, data])

  useEffect(() => {
    // onSelectedPricings([])
    setPricingsMap([])
  }, [clientId])

  function handleAppendPricings(pricing: TonnagePricing, route: RouteDetails) {
    setPricingsMap((prev) => {
      const existingRoute = prev.find((ele) => ele.route_id === route.route_id)

      // 1. route does not exist yet → create it
      if (!existingRoute) {
        const { route_id, origin, destination, distance_km, max_hrs, min_hrs } =
          route

        return [
          ...prev,
          {
            tempId: route_id,
            route_id,
            origin,
            destination,
            distance_km,
            max_hrs,
            min_hrs,
            pricings: [{ ...pricing, default_price: pricing.price, tons: "" }],
          },
        ]
      }
      const existingPricing = existingRoute.pricings.find(
        (p) => p.id === pricing.id
      )
      if (existingPricing) {
        return prev.filter((ele) => ele.route_id !== route.route_id)
      }

      return prev.map((ele) => {
        if (ele.route_id === route.route_id) {
          return {
            ...ele,
            pricings: [{ ...pricing, default_price: pricing.price, tons: "" }],
          }
        }
        return ele
      })
    })
  }

  useEffect(() => {
    setPricings(pricingsMap)
  }, [pricingsMap, selectedPricings])

  const hasPricings = (routeId: EntityId, pricingId: EntityId) =>
    pricingsMap
      .find((route) => route.route_id === routeId)
      ?.pricings.find((pricing) => pricing.id === pricingId) !== undefined

  const totalPrincings = useMemo(() => {
    return pricingsMap.reduce((sum, route) => sum + route.pricings.length, 0)
  }, [pricingsMap])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-description="Route Pricing"
        aria-describedby="app"
        className="flex max-h-[90vh] min-h-[90vh] flex-col overflow-y-auto md:min-w-[90vw]"
      >
        <DialogHeader className="min-h-8">
          <DialogTitle>Location Pricing</DialogTitle>
          <DialogDescription>
            Client configured Route Pricing
            <Button
              type="button"
              onClick={() => {
                onSelectedPricings(pricings)
                onOpenChange(false)
              }}
            >
              Accept
            </Button>
          </DialogDescription>
        </DialogHeader>
        <div className="grid min-h-full gap-4 space-y-4 overflow-y-auto md:grid-cols-5">
          <div className="space-y-4 md:col-span-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for locations..."
              type="search"
            />
            {isLoading && <div>Loading.....</div>}
            <div>
              <div className="flex flex-col gap-4">
                {filteredRoutes.map((route, index) => (
                  <Item
                    key={`${route.route_id}__${index}`}
                    variant={"outline"}
                    className={cn(
                      "border-dashed",
                      query.toLowerCase().length > 0 &&
                        route.destination
                          .toLowerCase()
                          .includes(query.toLowerCase()) &&
                        "bg-background"
                    )}
                  >
                    <ItemContent>
                      <ItemTitle>{route.destination}</ItemTitle>
                      <ItemDescription>
                        {route.min_hrs} hrs to {route.max_hrs} hrs Distance{" "}
                        {route.distance_km} km
                      </ItemDescription>
                      <div className="flex flex-row flex-wrap gap-4">
                        {route.pricings.map((pricing) => (
                          <Item
                            key={pricing.id}
                            variant={
                              hasPricings(route.route_id, pricing.id)
                                ? "outline"
                                : "muted"
                            }
                            className={cn(
                              hasPricings(route.route_id, pricing.id) &&
                                "border-primary"
                            )}
                            onClick={() => handleAppendPricings(pricing, route)}
                          >
                            <ItemContent>
                              <ItemTitle>
                                {formatPrice(pricing.price)}
                              </ItemTitle>
                              <ItemDescription>
                                {pricing.min_tons} TONS to {pricing.max_tons}{" "}
                                TONS
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        ))}
                      </div>
                    </ItemContent>
                  </Item>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Sortable
              value={pricings}
              onValueChange={(updated) => {
                setPricings(updated)
              }}
              getItemValue={(item) => item.route_id}
            >
              <SortableContent asChild>
                <div className="flex flex-col gap-2">
                  {pricings.map((r) => (
                    <SortableItem key={r.route_id} value={r.route_id} asChild>
                      <div>
                        <SortableItemHandle asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <GripVertical className="h-4 w-4" />
                          </Button>
                        </SortableItemHandle>
                        <div>{r.destination}</div>
                        {r.pricings.map((p) => (
                          <div key={p.id}>
                            <div>
                              {p.min_tons}-{p.max_tons} TONS
                            </div>
                            <div>{formatPrice(p.default_price)}</div>
                          </div>
                        ))}
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </SortableContent>
            </Sortable>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
