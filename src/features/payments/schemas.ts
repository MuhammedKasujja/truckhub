import z from "zod";
import { Payment } from "@/features/payments/types";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import {
  parseAsString,
  parseAsArrayOf,
  parseAsInteger,
  parseAsStringEnum,
  parseAsStringLiteral,
  createSearchParamsCache,
} from "nuqs/server";
import { formatPrice } from "@/lib/format";
import { PaymentStatuses, PaymentModeList } from "@/config/constants";

/**
 *
 * @param maxAmount zero value means already fully paid
 * @returns
 */
export const createEditPaymentSchema = (maxAmount: number = 0) => {
  // TODO: get company min amount from settings
  const companyMinAmount = 5;

  const minAmount =
    maxAmount > 0 && maxAmount < companyMinAmount
      ? maxAmount
      : companyMinAmount;

  return z.object({
    id: z.number().optional().nullable(),
    entity_id: z.number(),
    amount: z
      .number()
      .min(minAmount)
      .max(maxAmount, {
        error: `Payment amount cannot exceed ${formatPrice(maxAmount, { showZeroAsNumber: true })}`,
      }),
    payment_mode: z.string(),
    transaction_ref: z.string().optional().nullable(),
    type: z.enum(["booking", "ride"]),
  });
};

export type PaymentEditSchemaType = z.infer<
  ReturnType<typeof createEditPaymentSchema>
>;

export const PaymentSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  status: parseAsArrayOf(
    parseAsStringLiteral(PaymentStatuses),
  ).withDefault([]),
  sort: getSortingStateParser<Payment>().withDefault([
    { id: "date", desc: true },
  ]),
  search: parseAsString.withDefault(""),
  date: parseAsInteger.withDefault(0),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});

export type PaymentListSearchParams = Awaited<
  ReturnType<typeof PaymentSearchParamsCache.parse>
>;
