import { format } from "date-fns"
import type { NumberingEntityKey } from "./schemas"
import { ENTITY_NUMBER_PATTERNS } from "@/common/constants"

export const COUNTER_TOKEN = "{counter}"

/** What each token stands for, shown next to the token chips. */
export const TOKEN_DESCRIPTIONS: Record<string, string> = {
  "{counter}": "Running number",
  "{year}": "Year",
  "{month}": "Month",
  "{date}": "Full date",
  "{day}": "Day",
  "{client_short_name}": "Client short name",
}

const TOKEN_PATTERN = /\{[^{}]*\}/g

function sampleTokenValue(
  token: string,
  counter: string,
  date: Date
): string | undefined {
  switch (token) {
    case "{counter}":
      return counter
    case "{year}":
      return format(date, "yyyy")
    case "{month}":
      return format(date, "MM")
    case "{date}":
      return format(date, "yyyyMMdd")
    case "{day}":
      return format(date, "dd")
    case "{client_short_name}":
      return "TASO"
    default:
      return undefined
  }
}

export function padCounter(value: number, padding: string | number) {
  const width = Math.min(Math.max(Number(padding) || 0, 0), 12)
  return String(value).padStart(width, "0")
}

/**
 * Example of the next number this pattern produces. Tokens the entity does
 * not support are left as typed so the preview shows the mistake.
 */
export function previewEntityNumber({
  entity,
  pattern,
  padding,
  lastNumber,
  date = new Date(),
}: {
  entity: NumberingEntityKey
  pattern: string
  padding: string | number
  lastNumber?: number
  date?: Date
}) {
  const allowed = ENTITY_NUMBER_PATTERNS[entity]
  const counter = padCounter((lastNumber ?? 0) + 1, padding)
  return pattern.replace(TOKEN_PATTERN, (token) =>
    allowed.includes(token)
      ? (sampleTokenValue(token, counter, date) ?? token)
      : token
  )
}

/** Tokens in the pattern that this entity does not support. */
export function findUnknownTokens(entity: NumberingEntityKey, pattern: string) {
  const allowed = ENTITY_NUMBER_PATTERNS[entity]
  const found = pattern.match(TOKEN_PATTERN) ?? []
  return [...new Set(found.filter((token) => !allowed.includes(token)))]
}
