import z from "zod"
import { IDSchema } from "@/schemas"
import { formatMoney } from "@/lib/format"
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
  amount: z.number().min(1),
  ...EditPaymentBaseSchema.shape,
})

/**
 *
 * @param maxAmount zero value means already fully paid
 * @returns
 */
export const createEditPaymentSchema = (maxAmount: number = 0) => {
  // TODO: get company min amount from settings
  const companyMinAmount = 5

  const minAmount =
    maxAmount > 0 && maxAmount < companyMinAmount ? maxAmount : companyMinAmount

  return z.object({
    amount: z
      .number()
      .min(minAmount)
      .max(maxAmount, {
        error: `Payment amount cannot exceed ${formatMoney(maxAmount, { showZeroAsNumber: true })}`,
      }),
    ...EditPaymentBaseSchema.shape,
  })
}

export type PaymentEditSchemaType = z.infer<
  ReturnType<typeof createEditPaymentSchema>
>

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
