import z from "zod"

export const TaxRateCreateSchema = z.object({
  name: z.string(),
  rate: z.union([z.number(), z.string()]),
  description: z.string().nullable().optional(),
})

export const TaxRateUpdateSchema = z.object({
  id: z.string(),
  ...TaxRateCreateSchema.partial().shape,
})

export type TaxRateCreateSchemaType = z.infer<typeof TaxRateCreateSchema>

export type TaxRateUpdateSchemaType = z.infer<typeof TaxRateUpdateSchema>
