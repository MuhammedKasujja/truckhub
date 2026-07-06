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
  createMode: "dialog" | "page",
}
