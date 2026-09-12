import { EntityId } from "@/schemas"

export type TonnagePricing = {
  id: EntityId
  min_tons: string
  max_tons: string
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
  distance_km: string
  min_hrs: string
  max_hrs: string
  pricings: TonnagePricing[]
}

export type RoutePricingResponse = {
  effective_date: string
  tonnages: TonnageRange[]
  routes: RoutePricing[]
}

type IslandPricingDto = {
  island_id: EntityId
  price: string
}

export type IslandPricingCreateDto = {
  pricings: IslandPricingDto[]
  valid_from: string | Date
}

export type IslandPricingItem = {
  id: EntityId
  island_id: string
  name: string
  locations: string[]
  general_price: string
}

export type IslandPricingResponse = {
  effective_date: string
  pricings: IslandPricingItem[]
}

export type DistanceTonnagePricingItem = {
  id: EntityId
  distance_min_km: number
  distance_max_km: number | null
  distance_no_upper_limit: boolean
  tonnage_min: number
  tonnage_max: number
  min_price: string
  max_price: string
}

export type DistanceTonnagePricingResponse = {
  effective_date: Date
  pricings: DistanceTonnagePricingItem[]
}

export type LoadingOffloadingPricingItem = {
  id: EntityId
  tonnage_min: string
  tonnage_max: string
  cbm_min: string
  cbm_max: string
  loading_fees: string
  offloading_fees: string
}

export type LoadingOffloadingPricingResponse = {
  effective_date: Date | string
  pricings: LoadingOffloadingPricingItem[]
}

export type LoadingOffloadingPricingSnapshot = LoadingOffloadingPricingResponse

export type PricingDates = {
  dates: string[]
  active_date: string | null
}

export type CompanyPricingDates = {
  route_tonnage: PricingDates
  island: PricingDates
  distance_tonnage: PricingDates
  loading_offloading: PricingDates
}

export type ClientPricingDates = {
  route_tonnage: PricingDates
  island: PricingDates
  loading_offloading: PricingDates
}
