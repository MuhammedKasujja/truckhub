import z from "zod"

export const CompanySchema = z.object({
  name: z.string().min(2, "Required"),
  email: z.email(),
  phone: z.string().min(2, "Required"),
  website: z.url().optional().nullable(),
  address: z.string().optional().nullable(),
  description: z.string().min(3).optional().nullable(),
})

export const EditInvoiceTermsSchema = z.object({
  invoiceTerms: z
    .array(z.object({ value: z.string() }))
    .optional()
    .nullable(),
  quotationTerms: z
    .array(z.object({ value: z.string() }))
    .optional()
    .nullable(),
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

export type EditInvoiceTermsRequest = z.infer<typeof EditInvoiceTermsSchema>

export type Company = z.infer<typeof CompanySchema>

export interface CompanySettings extends Settings {
  company: Company
}
