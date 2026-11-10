import z from "zod"
import { IDSchema } from "@/schemas"

const RouteFieldsSchema = z.object({
  origin: z.string().trim().min(1, "Origin is required"),
  destination: z.string().trim().min(1, "Destination is required"),
  distance_km: z
    .number({ error: "Enter the distance" })
    .positive("Distance must be more than 0"),
  min_hrs: z
    .number({ error: "Enter the minimum hours" })
    .min(0, "Can't be negative"),
  max_hrs: z.number({ error: "Enter the maximum hours" }),
})

type RouteFields = z.infer<typeof RouteFieldsSchema>

const maxAfterMin = {
  check: (d: Pick<RouteFields, "min_hrs" | "max_hrs">) => d.max_hrs > d.min_hrs,
  params: { message: "Must be more than the minimum", path: ["max_hrs"] },
}

export const RouteCreateSchema = RouteFieldsSchema.refine(
  maxAfterMin.check,
  maxAfterMin.params
)

export const RouteUpdateSchema = RouteFieldsSchema.extend({
  id: IDSchema,
}).refine(maxAfterMin.check, maxAfterMin.params)

export type RouteCreateType = z.infer<typeof RouteCreateSchema>

export type RouteUpdateType = z.infer<typeof RouteUpdateSchema>

export type BookingRoute = RouteUpdateType
