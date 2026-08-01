import z from "zod"
import { Shipment } from "./types"
import { IDSchema } from "@/schemas"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const ShipmentSearchParams = z.object({
  sort: getSortingStateSchema<Shipment>().default([]),
  // advanced filter
  filters: getFiltersStateSchema<Shipment>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

const consumedFuelRateSchema = z.object({
  value: z.number().optional().nullable(),
})

export const dispatchShipmentSchema = z.object({
  unitId: IDSchema,
  startMileage: z.number(),
})

export const assignShipmentVehicleSchema = z.object({
  unitId: IDSchema,
  vehicleId: IDSchema,
})

export const assignShipmentDriverSchema = z.object({
  unitId: IDSchema,
  driverId: IDSchema,
})

export const finishShipmentSchema = z.object({
  unitId: IDSchema,
  start_mileage: z.number(),
  end_mileage: z.number(),
  distance_km: z.number(),
  average_fuel_rate_per_km: z.number(),
  fuel_used_litres: z.number(),
  fuel_rate: z.number(),
  actual_fuel_consumed: z.number(),
  note: z.string().optional().nullable(),
  consumed_fuel_rates: z.array(consumedFuelRateSchema),
})

export type FinishShipmentInput = z.infer<typeof finishShipmentSchema>

export type DispatchShipmentInput = z.infer<typeof dispatchShipmentSchema>

export type AssignShipmentVehicleInput = z.infer<
  typeof assignShipmentVehicleSchema
>

export type AssignShipmentDriverInput = z.infer<
  typeof assignShipmentDriverSchema
>

export type ShipmentSearchParamsInput = z.infer<typeof ShipmentSearchParams>
