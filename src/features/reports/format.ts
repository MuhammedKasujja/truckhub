import { CURRENCY_CODE } from "@/config/constants"
import { formatMoney } from "@/lib/format"

const compactCurrency = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: CURRENCY_CODE,
  notation: "compact",
  maximumFractionDigits: 1,
})

const compactNumber = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
})

const integer = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

/** Full amount below 1M, compact (e.g. "UGX 48.2M") above, so KPI cards stay one line. */
export const compactMoney = (value: number | string | null | undefined) =>
  Math.abs(Number(value ?? 0)) >= 1_000_000
    ? compactCurrency.format(Number(value))
    : formatMoney(Number(value ?? 0))

export const formatCompact = (value: number | string) =>
  compactNumber.format(Number(value))

export const formatCount = (value: number | string | null | undefined) =>
  integer.format(Number(value ?? 0))

export const formatPercent = (value: number | string | null | undefined) =>
  `${Math.round(Number(value ?? 0))}%`

export const formatKm = (value: number | string | null | undefined) =>
  `${integer.format(Number(value ?? 0))} km`

export const formatLitres = (value: number | string | null | undefined) =>
  `${integer.format(Number(value ?? 0))} L`

export const humanize = (value: string) =>
  value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
