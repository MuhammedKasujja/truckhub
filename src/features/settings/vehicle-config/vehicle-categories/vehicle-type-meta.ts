import { Bus, Car, Truck } from "lucide-react"
import type { VehicleType } from "./enums"

/** Label and icon for each vehicle type. */
export const vehicleTypeMeta: Record<
  VehicleType,
  { label: string; icon: typeof Truck }
> = {
  truck: { label: "Truck", icon: Truck },
  van: { label: "Van", icon: Bus },
  car: { label: "Car", icon: Car },
}
