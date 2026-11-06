import type { VehicleStatus } from "./enums"
import type { Vehicle } from "./types"

// "metallicSilver" -> "Metallic Silver", "on_trip" -> "On trip"
export const humanize = (value: string | null | undefined) => {
  if (!value) return "-"
  const spaced = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

// Fix known data typos ("desel" is stored as an enum value) before display
export const engineLabel = (engine: string | null | undefined) =>
  engine?.toLowerCase() === "desel" ? "Diesel" : humanize(engine)

export type VehicleStatusTone = "success" | "info" | "warning" | "error" | "default"

export const VEHICLE_STATUS_META: Record<
  VehicleStatus,
  { label: string; tone: VehicleStatusTone }
> = {
  available: { label: "Available", tone: "success" },
  on_trip: { label: "On trip", tone: "info" },
  reserved: { label: "Reserved", tone: "warning" },
  rented: { label: "Rented", tone: "warning" },
  in_maintenance: { label: "In maintenance", tone: "error" },
}

export const vehicleStatusMeta = (status: VehicleStatus | string) =>
  VEHICLE_STATUS_META[status as VehicleStatus] ?? {
    label: humanize(status),
    tone: "default" as const,
  }

export const vehicleName = (v: Pick<Vehicle, "car_model">) =>
  `${v.car_model.car_brand.name} ${v.car_model.name}`
