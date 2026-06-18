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
import React, { useEffect, useMemo, useState } from "react"
import { RoutePricingStruct } from "../schemas"

type RoutePricingDialogProps = {
  clientId: EntityId
  trigger: React.ReactNode
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

export function RoutePricingDialog({
  clientId,
  trigger,
  onSelectedPricings,
}: RoutePricingDialogProps) {
  const { data, isLoading } = useClientRoutingPricing(clientId)
  const [pricingsMap, setPricingsMap] = useState<RoutePricingStruct[]>([])
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
    onSelectedPricings([])
    setPricingsMap([])
  }, [clientId])

  function handleAppendPricings(pricing: TonnagePricing, route: RouteDetails) {
    setPricingsMap((prev) => {
      const index = prev.findIndex((ele) => ele.route_id === route.route_id)

      // 1. route does not exist yet → create it
      if (index === -1) {
        const { route_id, origin, destination, distance_km, max_hrs, min_hrs } =
          route

        return [
          ...prev,
          {
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

      // 2. update existing route immutably
      return prev.map((item, i) => {
        if (i !== index) return item

        const exists = item.pricings.some((p) => p.id === pricing.id)

        return {
          ...item,
          pricings: exists
            ? item.pricings.filter((p) => p.id !== pricing.id)
            : [
                ...item.pricings,
                { ...pricing, default_price: pricing.price, tons: "" },
              ],
        }
      })
    })
  }

  useEffect(() => {
    onSelectedPricings(pricingsMap)
  }, [pricingsMap, onSelectedPricings])

  const hasPricings = (routeId: EntityId, pricingId: EntityId) =>
    pricingsMap
      .find((route) => route.route_id === routeId)
      ?.pricings.find((pricing) => pricing.id === pricingId) !== undefined

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        aria-description="Route Pricing"
        aria-describedby="app"
        className="flex max-h-[90vh] min-h-[90vh] flex-col overflow-y-auto md:min-w-[90vw]"
      >
        <DialogHeader className="min-h-8">
          <DialogTitle>Location Pricing {pricingsMap.length}</DialogTitle>
          <DialogDescription>Client configured Route Pricing</DialogDescription>
        </DialogHeader>
        <div className="min-h-full space-y-4 overflow-y-auto">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} />
          {isLoading && <div>Loading.....</div>}
          <div className="flex flex-col gap-4">
            {filteredRoutes.map((route, index) => (
              <Item key={`${route.route_id}__${index}`} variant={"outline"}>
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
                          <ItemTitle>{formatPrice(pricing.price)}</ItemTitle>
                          <ItemDescription>
                            {pricing.min_tons} TONS to {pricing.max_tons} TONS
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
      </DialogContent>
    </Dialog>
  )
}
