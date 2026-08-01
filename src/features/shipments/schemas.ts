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
  startMileage: z.number(),
  endMileage: z.number(),
  distanceKm: z.number(),
  vehicleConsumptionRate: z.number(),
  fuelUsedLitres: z.number(),
  fuelRate: z.number(),
  actualFuelConsumed: z.number(),
  notes: z.string().optional().nullable(),
  consumedFuelRates: z.array(consumedFuelRateSchema),
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
