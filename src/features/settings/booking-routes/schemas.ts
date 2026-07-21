import z from "zod"
import { IDSchema } from "@/schemas"

export const RouteCreateSchema = z
  .object({
    origin: z.string().min(1, "Required"),
    destination: z.string().min(1, "Origin is required"),
    distance_km: z.number(),
    min_hrs: z.number(),
    max_hrs: z.number(),
  })
  .refine((d) => d.max_hrs > d.min_hrs, {
    message: "Max must be greater than min",
    path: ["max_hrs"],
  })

export const RouteUpdateSchema = z.object({
  id: IDSchema,
  ...RouteCreateSchema.shape
})

export type RouteCreateType = z.infer<typeof RouteCreateSchema>

export type RouteUpdateType = z.infer<typeof RouteUpdateSchema>

export type BookingRoute =  RouteUpdateType
