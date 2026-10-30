import { z } from "zod"
import { PLATE_REGEX } from "@/common/constants"

export const DefaultSearchParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(10),
  search: z.string().default(""),
  created_at: z.array(z.number().int()).optional(),
  joinOperator: z.enum(["and", "or"]).optional(),
})

export const EntityPickerSearchParams = z.object({
  prefill: z.string().optional(),
  returnTo: z.string().optional(),
  field: z.string().optional(),
})

export type EntityPickerSearchParamsInput = z.infer<
  typeof EntityPickerSearchParams
>

export const plateNumberSchema = z
  .string("Required")
  .regex(PLATE_REGEX, "Use format UA 567PL or UAN 789K")

export const tinNumberSchema = z
  .string()
  .regex(/^\d{10}$/, "TIN must be 10 digits")

export const telephoneNumberSchema = z
  .string()
  .regex(/^0\d{9}$/, "Invalid phone number")
