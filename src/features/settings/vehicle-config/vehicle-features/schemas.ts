import z from "zod"
import { IDSchema } from "@/schemas"

export const vehicleFeatureSchema = z.object({
  id: IDSchema.optional().nullable(),
  name: z.string(),
  is_active: z.boolean().default(true).optional(),
})

export const vehicleFeatureFormSchema = z.object({
  features: z.array(vehicleFeatureSchema).min(1, "Required"),
})
