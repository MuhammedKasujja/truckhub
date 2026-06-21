import z from "zod"

export const CompanySchema = z.object({
  name: z.string(),
  email: z.email(),
  phone: z.string(),
  website: z.url().optional().nullable(),
  description: z.string().min(3).optional().nullable(),
})

export const EditSettingsSchema = z.object({
  search_radius: z.number(),
  counter_padding: z.number().optional(),
  date_format: z.string().min(2, "Required").optional(),
  currency_code: z.string().min(2, "Required").optional(),
  invoice_terms: z.array(z.string()).optional().nullable(),
  quotation_terms: z.array(z.string()).optional().nullable(),
})

export type Settings = z.infer<typeof EditSettingsSchema>

export type EditSettingsSchemaType = z.infer<typeof EditSettingsSchema>

export type Company = z.infer<typeof CompanySchema>

export interface CompanySettings extends Settings {
  company: Company
}
