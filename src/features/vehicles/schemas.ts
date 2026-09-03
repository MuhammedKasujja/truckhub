import z from "zod"
import { IDSchema } from "@/schemas"
import { vehicleStatuses } from "./enums"
import { EngineTypes, Gearboxes, Vehicle } from "@/features/vehicles/types"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"
import { DefaultSearchParamsSchema, plateNumberSchema } from "@/common/schemas"

export const VehicleCreateSchema = z.object({
  plate_number: plateNumberSchema,
  color: z.string("Exteria color is needed"),
  interior_color: z.string().optional().nullable(),
  cylinders: z.string(),
  tank_capacity: z.number(),
  fuel_consumption_rate: z.number(),
  engine_type: z.enum(EngineTypes),
  gearbox: z.enum(Gearboxes),
  // year: z.number().min(2010).max((new Date()).getFullYear()),
  year: z.string(),
  seats: z.number().optional().nullable(),
  total_axles: z.string().optional().nullable(),
  vehicle_category_id: IDSchema,
  car_brand_id: IDSchema,
  car_model_id: IDSchema,
  drive_train_id: IDSchema,
  tonnage_id: IDSchema.optional().nullable(),
  second_plate_number: z.string().optional().nullable(),
  features: z.array(IDSchema).default([]).optional(),
  tonnage_capacity: z.union([z.number(), z.string()]).optional().nullable(),
})

export const VehicleUpdateSchema = z.object({
  id: IDSchema,
  ...VehicleCreateSchema.partial().shape,
})

export type VehicleCreateSchemaType = z.infer<typeof VehicleCreateSchema>

export type VehicleUpdateSchemaType = z.infer<typeof VehicleUpdateSchema>

export const VehicleSearchParamsCache = z.object({
  sort: getSortingStateSchema<Vehicle>().default([
    { id: "created_at", desc: true },
  ]).optional(),
  status: z.enum(vehicleStatuses).optional(),
  // advanced table filter
  filters: getFiltersStateSchema().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type VehicleListSearchParams = z.infer<typeof VehicleSearchParamsCache>

export const AssignDriverVehicleSchema = z.object({
  vehicleId: IDSchema,
  driverId: IDSchema,
})

export type AssignDriverVehicleType = z.infer<typeof AssignDriverVehicleSchema>
