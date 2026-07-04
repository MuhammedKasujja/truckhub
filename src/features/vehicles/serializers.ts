import { Vehicle } from "./types"

export function toEditVehicle(data: Vehicle | undefined) {
  if (!data) return undefined
  return {
    ...data,
    car_brand_id: data?.car_model.car_brand.id,
    cylinders: data?.cylinders.toString(),
    car_model_id: data?.car_model_id,
    features: data?.features.map((feat) => feat.id),
    total_axles: data?.total_axles?.toString(),
    consumption_rate: Number(data?.consumption_rate),
  }
}
