export type EntityPickerProps<T> = {
  id?: string
  value?: T | string | null
  label?: string
  placeholder?: string
  disabled?: boolean
  /** Switch to remote API search instead of local filter */
  remote?: boolean
  /** Min chars before triggering remote search */
  minSearchLength?: number
  onSelected?: (value: T | null | undefined) => void
  createMode?: "dialog" | "page"
}

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
