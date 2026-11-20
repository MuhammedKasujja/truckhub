import z from "zod"
import { Shipment } from "./types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { type EntityId, IDSchema, MoneySchema } from "@/schemas"
import {
  reassignmentReasonsList,
  shipmentDelayReasons,
  shipmentStatuses,
} from "./enums"
import { EngineTypes, vehicleTransmissionList } from "../vehicles/types"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const ShipmentSearchParams = z.object({
  sort: getSortingStateSchema<Shipment>().default([]),
  // advanced filter
  status: z.array(z.enum(shipmentStatuses)).optional(),
  // true: only trips behind their plan; false: only the rest
  delayed: z.boolean().optional(),
  filters: getFiltersStateSchema<Shipment>().optional(),
  ...DefaultSearchParamsSchema.shape,
})

const consumedFuelRateSchema = z.object({
  value: MoneySchema.optional().nullable(),
})

export const dispatchShipmentSchema = z.object({
  unitId: IDSchema,
  startMileage: z.number("Required").positive(),
  contactName: z.string("Required").min(3, "Required"),
})

export const assignShipmentVehicleSchema = z.object({
  unitId: IDSchema,
  vehicleId: IDSchema,
})

export const changeShipmentVehicleSchema = z.object({
  unitId: IDSchema,
  newVehicleId: IDSchema,
  note: z.string().trim().nullable().optional(),
  reason: z.enum(reassignmentReasonsList, "Required"),
})

export const assignShipmentDriverSchema = z.object({
  unitId: IDSchema,
  driverId: IDSchema,
})

const notInFuture = (date: Date | null | undefined) =>
  !date || date.getTime() <= Date.now()

const isPositiveAmount = (value: string | null | undefined) =>
  !!value && Number(value) > 0

export const recordShipmentDetailsSchema = z
  .object({
    unitId: IDSchema,
    startMileage: z.string(),
    endMileage: z
      .string("Required")
      .trim()
      .min(1, "Required")
      .regex(/^\d+(\.\d+)?$/, "Enter the odometer reading"),
    distanceKm: z.string(),
    vehicleConsumptionRate: MoneySchema,
    fuelUsedLitres: MoneySchema.optional(),
    fuelRate: MoneySchema.optional(),
    actualFuelConsumed: MoneySchema,
    notes: z.string().optional().nullable(),
    // Only asked for a trip that is still on the road: saving its details ends it
    endedAt: z
      .date()
      .optional()
      .nullable()
      .refine(notInFuture, "Cannot be in the future"),
    // The API prices fuel from the average, so it needs at least one price
    consumedFuelRates: z
      .array(consumedFuelRateSchema)
      .refine(
        (rates) => rates.some((r) => isPositiveAmount(r.value)),
        "Enter at least one fuel price"
      ),
  })
  .refine(
    (data) =>
      !data.startMileage || Number(data.endMileage) >= Number(data.startMileage),
    { path: ["endMileage"], message: "Must not be lower than the start reading" }
  )

export const endShipmentSchema = z.object({
  unitId: IDSchema,
  endMileage: z.number("Required").nonnegative(),
  endedAt: z.date().refine(notInFuture, "Cannot be in the future"),
})

const inFuture = (date: Date | null | undefined) =>
  !date || date.getTime() > Date.now()

export const reportShipmentDelaySchema = z
  .object({
    unitId: IDSchema,
    reason: z.enum(shipmentDelayReasons, "Required"),
    // An estimate of when the trip will be back; it can be left out
    expectedEnd: z
      .date()
      .optional()
      .nullable()
      .refine(inFuture, "Must be in the future"),
    note: z.string().trim().max(500, "Too long").nullable().optional(),
  })
  .refine((data) => data.reason !== "other" || !!data.note, {
    path: ["note"],
    message: "Say what is holding the trip up",
  })

export type ReportShipmentDelayInput = z.infer<typeof reportShipmentDelaySchema>

export type EndShipmentInput = z.infer<typeof endShipmentSchema>

export type RecordShipmentDetailsInput = z.infer<
  typeof recordShipmentDetailsSchema
>

export type DispatchShipmentInput = z.infer<typeof dispatchShipmentSchema>

export type AssignShipmentVehicleInput = z.infer<
  typeof assignShipmentVehicleSchema
>

export type ChangeShipmentVehicleInput = z.infer<
  typeof changeShipmentVehicleSchema
>

export type AssignShipmentDriverInput = z.infer<
  typeof assignShipmentDriverSchema
>

export type ShipmentSearchParamsInput = z.infer<typeof ShipmentSearchParams>

export type QuotationShipmentSearchParams = ShipmentSearchParamsInput & {
  quotation_id: EntityId
}

const vehicleFilterSchema = z.object({
  brand_id: IDSchema.nullable().optional(),
  model_id: IDSchema.nullable().optional(),
  category_id: IDSchema.nullable().optional(),
  tonnage: z.string().nullable().optional(),
  engine_type: z.enum(EngineTypes).nullable().optional(),
  gearbox: z.enum(vehicleTransmissionList).nullable().optional(),
  consumption_rate: z.string().nullable().optional(),
})

export type ShipmentVehicleFilters = z.infer<typeof vehicleFilterSchema>
