import z from "zod"
import { IDSchema } from "@/schemas"

export const bankAccountCreateSchema = z.object({
  bank_id: IDSchema,
  account_name: z.string("Required").trim().min(3, "Too short"),
  account_number: z.string("Required").trim().min(3, "Too short"),
  branch: z.string("Required").trim().min(3, "Too short"),
})

export const bankAccountUpdateSchema = z.object({
  id: IDSchema,
  ...bankAccountCreateSchema.partial().shape,
})

export const bankDetailsCreateSchema = z.object({
  name: z.string(),
})

export const bankDetailsUpdateSchema = z.object({
  id: IDSchema,
  ...bankDetailsCreateSchema.partial().shape,
})

export type BankDetailsCreateInput = z.infer<typeof bankDetailsCreateSchema>

export type BankDetailsUpdateInput = z.infer<typeof bankDetailsUpdateSchema>

export type BankAccountCreateInput = z.infer<typeof bankAccountCreateSchema>

export type BankAccountUpdateInput = z.infer<typeof bankAccountUpdateSchema>
