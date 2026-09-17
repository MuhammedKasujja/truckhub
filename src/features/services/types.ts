import { EntityId } from "@/schemas"
import { ServiceCreateSchemaInput } from "./schemas"

export const DistanceUnitList = ["km", "miles"] as const

export type DistanceUnit = (typeof DistanceUnitList)[number]

export type Service = {
  name: string
  category: string
  display_name: string
  seats: number
  base_fare: string
  min_fare: string
  // price_per_min: string;
  // price_per_unit_distance: string;
  // booking_fee: number;
  // tax_fee: number;
  distance_unit: DistanceUnit
  vehicle_category_id: EntityId
  description: string | undefined
  id: EntityId
  is_truck: boolean
  created_at: Date
  updated_at: Date
}

export type ServiceGroup = {
  category: string
  is_truck: boolean
  services: Service[]
}

export interface ServicePricingRulePayload {
  name: string
  car_model_id: EntityId | null
  vehicle_category_id: EntityId | null
  start_year: string | null | undefined
  base_fare: string
  min_fare: string
  seats: number | null | undefined
}

export function toServicePricingApiPayload(
  values: ServiceCreateSchemaInput
): ServicePricingRulePayload {
  const resolvedCategoryId =
    values.target === "category"
      ? (values.capacity_id ?? values.vehicle_category_id ?? null)
      : null
      
  return {
    car_model_id:
      values.target === "model" ? (values.car_model_id ?? null) : null,
    vehicle_category_id: resolvedCategoryId,
    base_fare: values.base_fare,
    min_fare: values.min_fare,
    name: values.name,
    start_year: values.start_year,
    seats: values.seats,
  }
}
