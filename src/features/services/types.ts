import { EntityId } from "@/schemas"
import { ServiceCreateSchemaInput } from "./schemas"

export const DistanceUnitList = ["km", "miles"] as const

export type DistanceUnit = (typeof DistanceUnitList)[number]

type VehicleCategory = {
  id: EntityId
  name: string
}

type CarModel = {
  id: EntityId
  name: string
  seats: number | null
  manufacture_year: number | null
  consumption_rate: string | null
  car_brand: {
    id: EntityId
    name: string
  }
}

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
  vehicle_category_id: EntityId
  description: string | undefined
  id: EntityId
  is_truck: boolean
  created_at: Date
  updated_at: Date
  vehicle_category: VehicleCategory | null
  car_model: CarModel | null
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
