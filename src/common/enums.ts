import { ENGINE_MODES, LINE_ITEM_TYPES } from "./config"

export type LineItemType = (typeof LINE_ITEM_TYPES)[number]

export type EngineMode = (typeof ENGINE_MODES)[number]


export function isNotInEnum<T extends string | number>(
  value: T,
  list: readonly T[]
): boolean {
  return !list.includes(value)
}

export function isInEnum<T extends string | number>(
  value: T,
  list: readonly T[]
): boolean {
  return list.includes(value)
}

// export const createEnumChecker = <T extends string | number>() =>
//   (value: T, list: readonly T[]) => !list.includes(value);

// const isPaymentStatusNotIn = createEnumChecker<PaymentStatus>();

// isPaymentStatusNotIn(
//   payment.status,
//   [PaymentStatus.Paid, PaymentStatus.Refunded]
// );