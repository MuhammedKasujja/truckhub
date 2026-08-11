import z from "zod"
import { IDSchema, MoneySchema } from "@/schemas"
import { Payment } from "@/features/payments/types"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"
import {
  PaymentModeList,
  PaymentStatuses,
  PaymentEntityList,
} from "@/config/constants"

export const EditPaymentBaseSchema = z.object({
  id: IDSchema.optional().nullable(),
  entity_id: IDSchema,
  payment_mode: z.string(),
  transaction_ref: z.string().optional().nullable(),
  type: z.enum(PaymentEntityList),
})

export const EditPaymentSchema = z.object({
  amount: MoneySchema,
  ...EditPaymentBaseSchema.shape,
})

export const createEditPaymentSchema = z.object({
  amount: MoneySchema,
  ...EditPaymentBaseSchema.shape,
})

export type PaymentEditSchemaType = z.infer<typeof createEditPaymentSchema>

export const PaymentSearchParamsCache = z.object({
  status: z.array(z.enum(PaymentStatuses)).optional(),
  payment_method: z.array(z.enum(PaymentModeList)).optional(),
  // sort: getSortingStateSchema<Payment>().default([{ id: "date", desc: true }]),
  sort: getSortingStateSchema<Payment>().optional(),
  date: z.number().optional().nullable(),
  // advanced filter
  filters: getFiltersStateSchema().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type PaymentListSearchParams = z.infer<typeof PaymentSearchParamsCache>
