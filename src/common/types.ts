import { EntityId } from "@/schemas"

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

/**
 * Reuse across multiple entities (not just this one form) — built once, parameterized by your base values type
 */
export type BaseFormProps<TCreate, TEdit extends { id: EntityId }> =
  | {
      mode: "create"
      defaultValues?: Partial<TCreate>
      onSubmit: (values: TCreate) => void | Promise<void>
    }
  | {
      mode: "edit"
      defaultValues: TEdit
      onSubmit: (values: TEdit) => void | Promise<void>
    }

/**
 * If your edit type is always just "create shape + id", you can derive it automatically instead of declaring two separate generics
 */
export type FormProps<TCreate, IdType = EntityId> =
  | {
      mode: "create"
      defaultValues?: Partial<TCreate>
      onSubmit: (values: TCreate) => void | Promise<void>
    }
  | {
      mode: "edit"
      defaultValues: TCreate & { id: IdType }
      onSubmit: (values: TCreate & { id: IdType }) => void | Promise<void>
    }
