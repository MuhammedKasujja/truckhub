import { IDSchema } from "@/schemas"
import z from "zod"

export const tonnageRangeSchema = z
  .object({
    min_tons: z
      .number("Required")
      .min(0, "Must be above 0")
      .max(30, "Must be below 30"),
    max_tons: z
      .number("Required")
      .min(0, "Must be above 0")
      .max(30, "Must be below 30"),
    price: z.number("Required").min(0, "Price is required"),
    client_id: z.number().nullable().optional(),
  })
  .refine((d) => d.max_tons > d.min_tons, {
    message: "Max must be greater than min",
    path: ["max_tons"],
  })

export const routePricingSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  client_id: z.number().nullable().optional(),
  ranges: z
    .array(tonnageRangeSchema)
    .min(1, "At least 1 tonnage range is required"),
})

export const batchPricingSchema = z.object({
  valid_from: z.date("Pricing date is required"),
  client_id: IDSchema,
  routes: z.array(routePricingSchema).min(1, "Add at least one route"),
})

export type TonnageRangeInput = z.infer<typeof tonnageRangeSchema>
export type RoutePricingInput = z.infer<typeof routePricingSchema>
export type BatchPricingInput = z.infer<typeof batchPricingSchema>
