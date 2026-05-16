import z from "zod"
import { IDSchema } from "@/schemas"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { EngineTypes, Gearboxes, Vehicle } from "@/features/vehicles/types"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const VehicleCreateSchema = z.object({
  plate_number: z.string(),
  color: z.string(),
  interior_color: z.string().optional().nullable(),
  cylinders: z.string(),
  tank_capacity: z.number(),
  consumption_rate: z.number(),
  engine_type: z.enum(EngineTypes),
  gearbox: z.enum(Gearboxes),
  // year: z.number().min(2010).max((new Date()).getFullYear()),
  year: z.string(),
  seats: z.number().optional().nullable(),
  vehicle_type_id: z.number(),
  car_brand_id: z.number(),
  car_model_id: z.number(),
  drive_train_id: z.number(),
  tonnage_id: z.number().optional().nullable(),
})

export const VehicleUpdateSchema = z.object({
  id: z.number(),
  ...VehicleCreateSchema.partial().shape,
})

export type VehicleCreateSchemaType = z.infer<typeof VehicleCreateSchema>

export type VehicleUpdateSchemaType = z.infer<typeof VehicleUpdateSchema>

export const VehicleSearchParamsCache = z.object({
  sort: getSortingStateSchema<Vehicle>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type VehicleListSearchParams = z.infer<typeof VehicleSearchParamsCache>

export const AssignDriverVehicleSchema = z.object({
  vehicleId: IDSchema,
  driverId: IDSchema,
})

export type AssignDriverVehicleType = z.infer<typeof AssignDriverVehicleSchema>
