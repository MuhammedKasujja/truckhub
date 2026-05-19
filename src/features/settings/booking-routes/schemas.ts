import z from "zod"
import { EntityId } from "@/schemas"

export const RouteEditSchema = z
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

export type RouteEditType = z.infer<typeof RouteEditSchema>

export type BookingRoute =  { id: EntityId } & RouteEditType
