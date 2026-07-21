import {
  AutoComplete,
  AutoCompleteProps,
} from "@/components/ui/autocomplete-modified"
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { RequiredLabelIcon } from "@/components/required-label-icon"
import { cn } from "@/lib/utils"

export interface FormAutoCompleteProps<TFieldValues extends FieldValues, T> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  description?: string
  onSelected?: (value: T | null | undefined) => void
  /** Switch to remote API search instead of local filter */
  remote?: boolean
  /** Min chars before triggering remote search */
  minSearchLength?: number
  label: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  required?: boolean
  noResultsMessage?: React.ReactNode
  createMode?: "dialog" | "page"
}

interface FormAutoCompleteFieldProps<
  TFieldValues extends FieldValues,
  T,
> extends Omit<AutoCompleteProps<T>, "id" | "value" | "onChange"> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  description?: string
  onSelected?: (value: T | null | undefined) => void
  /** Switch to remote API search instead of local filter */
  remote?: boolean
  /** Min chars before triggering remote search */
  minSearchLength?: number
  required?: boolean
}

export function FormAutoComplete<TFieldValues extends FieldValues, T>({
  name,
  onSelected,
  options,
  getOptionValue,
  label,
  description,
  remote = false,
  control,
  filterFn,
  onSearch,
  required = false,
  ...props
}: FormAutoCompleteFieldProps<TFieldValues, T>) {
  return (
    <div className="flex flex-col gap-1">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          // string → T: look up the full object for display
          const selected =
            options.find((opt) => getOptionValue(opt) === field.value) ?? null

          return (
            <Field data-invalid={fieldState.invalid}>
              {label && (
                <FieldLabel htmlFor={field.name}>
                  {label}
                  {required && <RequiredLabelIcon />}
                </FieldLabel>
              )}
              <AutoComplete<T>
                label={label}
                {...props}
                id={field.name}
                options={options}
                className={cn(
                  !field.value && "text-muted-foreground",
                  fieldState.invalid && "border-destructive"
                )}
                // API mode search: pass onSearch, skip filterFn
                {...(remote
                  ? { onSearch: onSearch }
                  : {
                      filterFn: filterFn,
                    })}
                getOptionValue={getOptionValue}
                value={selected} // T | null ✓
                onChange={(val) => {
                  field.onChange(val ? getOptionValue(val) : null) // stores string
                  field.onBlur()
                  onSelected?.(val)
                }}
              />
              {description && (
                <FieldDescription>{description}</FieldDescription>
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )
        }}
      />
    </div>
  )
}
