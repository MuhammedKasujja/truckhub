import z from "zod"
import { IDSchema } from "@/schemas"
import { TaxRate } from "./tax-rates/types"

export const CompanySchema = z.object({
  name: z.string().trim().min(2, "Required"),
  email: z.email().trim(),
  email_2: z.email().trim().optional().nullable(),
  phone: z.string().trim().min(2, "Required"),
  phone_2: z.string().trim().optional().nullable(),
  website: z
    .url({ protocol: /^https?$/, hostname: z.regexes.domain })
    .trim()
    .optional()
    .nullable(),
  address: z.string().trim().optional().nullable(),
  description: z.string().trim().min(3).optional().nullable(),
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
  search_radius: z.number().optional(),
  counter_padding: z.number().optional(),
  date_format: z.string().min(2, "Required").optional(),
  currency_code: z.string().min(2, "Required").optional(),
  invoice_terms: z.array(z.string()).optional().nullable(),
  quotation_terms: z.array(z.string()).optional().nullable(),
  default_tax_rate_id: IDSchema.optional().nullable(),
  fiscal_year_start_month: z.string().optional().nullable(),
})

export type Settings = z.infer<typeof EditSettingsSchema>

export type EditSettingsSchemaType = z.infer<typeof EditSettingsSchema>

export type EditInvoiceTermsRequest = z.infer<typeof EditInvoiceTermsSchema>

export type Company = z.infer<typeof CompanySchema>

export interface CompanySettings extends Settings {
  company: Company
  default_tax_rate: TaxRate | null
}
