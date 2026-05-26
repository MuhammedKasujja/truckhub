import { EntityId } from "@/types"

export type TonnagePricing = {
  id: EntityId
  min_tons: string | number
  max_tons: string | number
  price: string | number
}

export type TonnageRange = {
  min_tons: string | number
  max_tons: string | number
}

export type RoutePricing = {
  route_id: EntityId
  origin: string
  destination: string
  distance_km: string | number
  min_hrs: string | number
  max_hrs: string | number
  pricings: TonnagePricing[]
}

export type RoutePricingResponse = {
  tonnages: TonnageRange[]
  routes: RoutePricing[]
}
