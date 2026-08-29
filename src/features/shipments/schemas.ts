import z from "zod"
import { Shipment } from "./types"
import { shipmentStatuses } from "./enums"
import { EntityId, IDSchema, MoneySchema } from "@/schemas"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const ShipmentSearchParams = z.object({
  sort: getSortingStateSchema<Shipment>().default([]),
  // advanced filter
  status: z.enum(shipmentStatuses).optional(),
  filters: getFiltersStateSchema<Shipment>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

const consumedFuelRateSchema = z.object({
  value: MoneySchema.optional().nullable(),
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

export const recordShipmentDetailsSchema = z.object({
  unitId: IDSchema,
  startMileage: z.number(),
  endMileage: z.number(),
  distanceKm: z.number(),
  vehicleConsumptionRate: MoneySchema,
  fuelUsedLitres: z.number().optional(),
  fuelRate: MoneySchema.optional(),
  actualFuelConsumed: MoneySchema,
  notes: z.string().optional().nullable(),
  consumedFuelRates: z.array(consumedFuelRateSchema),
})

export const endShipmentSchema = z.object({
  unitId: IDSchema,
  endMileage: z.number(),
})

export type EndShipmentInput = z.infer<typeof endShipmentSchema>

export type RecordShipmentDetailsInput = z.infer<
  typeof recordShipmentDetailsSchema
>

export type DispatchShipmentInput = z.infer<typeof dispatchShipmentSchema>

export type AssignShipmentVehicleInput = z.infer<
  typeof assignShipmentVehicleSchema
>

export type AssignShipmentDriverInput = z.infer<
  typeof assignShipmentDriverSchema
>

export type ShipmentSearchParamsInput = z.infer<typeof ShipmentSearchParams>

export type QuotationShipmentSearchParams = ShipmentSearchParamsInput & {
  quotation_id: EntityId
}
