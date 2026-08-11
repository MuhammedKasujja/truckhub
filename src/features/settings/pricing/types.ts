import { EntityId } from "@/schemas"

export type TonnagePricing = {
  id: EntityId
  min_tons: string | number
  max_tons: string | number
  price: string
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

export type DistanceTonnagePricingResponse = {
  id: EntityId
  distance_min_km: number
  distance_max_km: number | null
  distance_no_upper_limit: boolean
  tonnage_min: number
  tonnage_max: number
  min_price: string
  max_price: string
}
