import z from "zod"
import { formatPrice } from "@/lib/format"
import { Payment } from "@/features/payments/types"
import { PaymentStatuses } from "@/config/constants"
import { DefaultSearchParamsSchema } from "@/common/schemas"
import { getFiltersStateSchema, getSortingStateSchema } from "@/lib/parsers"

export const EditPaymentBaseSchema = z.object({
  id: z.number().optional().nullable(),
  entity_id: z.number(),
  payment_mode: z.string(),
  transaction_ref: z.string().optional().nullable(),
  type: z.enum(["booking", "ride"]),
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
        error: `Payment amount cannot exceed ${formatPrice(maxAmount, { showZeroAsNumber: true })}`,
      }),
    ...EditPaymentBaseSchema.shape,
  })
}

export type PaymentEditSchemaType = z.infer<
  ReturnType<typeof createEditPaymentSchema>
>

export const PaymentSearchParamsCache = z.object({
  status: z.array(z.enum(PaymentStatuses)).default([]),
  sort: getSortingStateSchema<Payment>().default([{ id: "date", desc: true }]),
  date: z.number().optional().nullable(),
  // advanced filter
  filters: getFiltersStateSchema().default([]),
  ...DefaultSearchParamsSchema.shape,
})

export type PaymentListSearchParams = z.infer<typeof PaymentSearchParamsCache>
