import z from "zod"
import { IDSchema } from "@/schemas"
import { accountPurposes, bankCountryCodes, currencies } from "./enums"

export const bankAccountCreateSchema = z.object({
  bank_id: IDSchema,
  account_name: z.string("Required").trim().min(3, "Too short"),
  account_number: z.string("Required").trim().min(3, "Too short"),
  branch: z.string("Required").trim().min(3, "Too short"),
  currency: z.enum(currencies),
  purpose: z.enum(accountPurposes).optional(),
  show_on_invoices: z.boolean().optional(),
})

export const bankAccountUpdateSchema = z.object({
  id: IDSchema,
  ...bankAccountCreateSchema.partial().shape,
})

export const bankDetailsCreateSchema = z.object({
  name: z.string(),
  country: z.enum(bankCountryCodes),
  swift_code: z.string().optional(),
})

export const bankDetailsUpdateSchema = z.object({
  id: IDSchema,
  ...bankDetailsCreateSchema.partial().shape,
})

export type BankDetailsCreateInput = z.infer<typeof bankDetailsCreateSchema>

export type BankDetailsUpdateInput = z.infer<typeof bankDetailsUpdateSchema>

export type BankAccountCreateInput = z.infer<typeof bankAccountCreateSchema>

export type BankAccountUpdateInput = z.infer<typeof bankAccountUpdateSchema>
