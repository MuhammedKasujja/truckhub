import z from "zod"
import { IDSchema } from "@/schemas"
import { RideRequest } from "@/features/ride-requests/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const LocationPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
})

export const LocationSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  place_id: z.string(),
})

export const CheckpointSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  distance: z.number(),
  time: z.number(),
  estimated_fare: z.number(),
  position: z.number(),
})

export const RideRequestCreateSchema = z.object({
  service_id: z.number(),
  customer_id: z.number(),
  driver_id: z.string().optional(),
  pickup_location: LocationSchema,
  destination_location: LocationSchema,
  requires_fuel: z.boolean().default(false).optional(),
  requires_loaders: z.boolean().default(false).optional(),
  is_scheduled: z.boolean().default(false).optional(),
  estimated_time: z.number().optional(),
  estimated_distance: z.number().optional(),
  request_start_time: z.date(),
  polyline_route: z.string().optional(),
  partial: z.number().optional().nullable(),
  discount: z.number().optional().nullable(),
  checkpoints: z.array(CheckpointSchema).optional().nullable(),
})

export const RideRequestUpdateSchema = z.object({
  id: z.number(),
  ...RideRequestCreateSchema.partial().shape,
})

export type RideRequestCreateSchemaType = z.infer<
  typeof RideRequestCreateSchema
>

export type RideRequestUpdateSchemaType = z.infer<
  typeof RideRequestUpdateSchema
>

export const RideRequestSearchParamsCache = z.object({
  sort: getSortingStateSchema<RideRequest>().default([
    { id: "created_at", desc: true },
  ]),
  // advanced filter
  filters: getFiltersStateSchema<RideRequest>().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type RideRequestListSearchParams = z.infer<
  typeof RideRequestSearchParamsCache
>

export type LocationPoint = z.infer<typeof LocationPointSchema>

export interface Location extends LocationPoint {
  name: string
}

export const EstimateRideFareSchema = z.object({
  serviceId: IDSchema,
  origin: LocationPointSchema,
  destination: LocationPointSchema,
})

export type EstimateRideFareDto = z.infer<typeof EstimateRideFareSchema>
