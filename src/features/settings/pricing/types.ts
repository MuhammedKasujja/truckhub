import { EntityId } from "@/schemas"

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
  effective_date: string
  tonnages: TonnageRange[]
  routes: RoutePricing[]
}

type IslandPricingDto = {
  name: string
  locations: string[]
  price: number | string
}

export type IslandPricingCreateDto = {
  pricings: IslandPricingDto[]
  valid_from: string | Date
}

export type IslandPricingResponse = {
  name: string
  locations: string[]
  general_price: number | string
}
