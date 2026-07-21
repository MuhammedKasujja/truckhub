import z from "zod"
import { IDSchema } from "@/schemas"

export const TaxRateCreateSchema = z.object({
  name: z.string(),
  rate: z.union([z.number(), z.string()]),
  description: z.string().nullable().optional(),
})

export const TaxRateUpdateSchema = z.object({
  id: IDSchema,
  ...TaxRateCreateSchema.partial().shape,
})

export type TaxRateCreateSchemaType = z.infer<typeof TaxRateCreateSchema>

export type TaxRateUpdateSchemaType = z.infer<typeof TaxRateUpdateSchema>
