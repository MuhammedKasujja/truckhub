import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { useClientRoutingPricing } from "@/features/clients/hooks/use-client-route-pricing"
import { formatPrice } from "@/lib/format"
import { EntityId } from "@/schemas"
import { useState } from "react"

type RoutePricingDialogProps = {
  clientId: EntityId
}

export function RoutePricingDialog({ clientId }: RoutePricingDialogProps) {
  const { data, isLoading } = useClientRoutingPricing(clientId)
  const [pricings, setPricings] = useState<EntityId[]>([])
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button">Routes</Button>
      </DialogTrigger>
      <DialogContent
        aria-description="Route Pricing"
        aria-describedby="app"
        className="flex max-h-[90vh] min-h-[90vh] flex-col overflow-y-auto md:min-w-[90vw]"
      >
        <DialogHeader className="min-h-8">
          <DialogTitle>Route Pricing</DialogTitle>
          <DialogDescription>Client configured Route Pricing</DialogDescription>
        </DialogHeader>
        <div className="min-h-full overflow-y-auto">
          {isLoading && <div>Loading.....</div>}
          <div className="flex flex-col gap-4">
            {data &&
              data.routes.map((route, index) => (
                <Item key={`${route.route_id}__${index}`} variant={"outline"}>
                  <ItemContent>
                    <ItemTitle>
                      {route.origin} - {route.destination}
                    </ItemTitle>
                    <ItemDescription>
                      {route.min_hrs} hrs to {route.max_hrs} hrs Distance{" "}
                      {route.distance_km} km
                    </ItemDescription>
                    <div className="flex flex-row flex-wrap gap-4">
                      {route.pricings.map((pricing) => (
                        <Item
                          key={pricing.id}
                          variant={pricings.includes(pricing.id)? "outline": "muted"}
                          onClick={() =>
                            setPricings((prev) => [...prev, pricing.id])
                          }
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
