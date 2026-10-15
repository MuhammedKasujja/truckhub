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
  entityId: IDSchema,
  paymentMethod: z.enum(PaymentModeList),
  clientId: IDSchema.optional(),
  paidAt: z.date().optional().nullable(),
  transactionRef: z.string().optional().nullable(),
  type: z.enum(PaymentEntityList),
})

export const paymentInputSchema = z.object({
  amount: MoneySchema,
  ...EditPaymentBaseSchema.shape,
})

export const paymentRequestSchema = z.object({
  ...paymentInputSchema.shape,
  idempotencyKey: z.string().trim().min(4),
})

export type PaymentEditSchemaType = z.infer<typeof paymentInputSchema>

export type PaymentRequestInput = z.infer<typeof paymentRequestSchema>

export type PaymentInput = z.infer<typeof paymentInputSchema>

export const PaymentSearchParamsCache = z.object({
  status: z.array(z.enum(PaymentStatuses)).optional(),
  payment_method: z.array(z.enum(PaymentModeList)).optional(),
  // sort: getSortingStateSchema<Payment>().default([{ id: "date", desc: true }]),
  sort: getSortingStateSchema<Payment>().default([{id: 'created_at', desc: true}]),
  date: z.number().optional().nullable(),
  // advanced filter
  filters: getFiltersStateSchema().optional(),
  ...DefaultSearchParamsSchema.shape,
})

export type PaymentListSearchParams = z.infer<typeof PaymentSearchParamsCache>
