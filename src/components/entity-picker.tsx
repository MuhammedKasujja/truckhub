import { useController } from "react-hook-form"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { Control, FieldPath, FieldValues } from "react-hook-form"
import {
  useEntityPicker,
  type EntityPickerConfig,
  type UseEntityPickerOverrides,
} from "@/lib/use-entity-picker"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { RequiredLabelIcon } from "@/components/required-label-icon"
import { AutoComplete } from "@/components/ui/autocomplete-modified"

export interface PickerProps<T> {
  value: T | string | null | undefined
  onChange: (value: T | null | undefined) => void
  disabled?: boolean
  renderOption?: (item: T, selected: boolean) => React.ReactNode
  renderValue?: (item: T) => React.ReactNode
  staticOptions?: T[] | (() => Promise<T[]>)
  filterFn?: (option: T, query: string) => boolean
}

export function createEntityPicker<
  T,
  TSearchParams extends { search: string } = { search: string },
>(
  config: EntityPickerConfig<T, TSearchParams> & {
    label: string
    renderOption: (item: T, selected: boolean) => React.ReactNode
    renderValue?: (item: T) => React.ReactNode
    CreateForm?: React.ComponentType<{
      prefill: string
      onCreated: (item: T) => void
      submitting?: boolean
    }>
  }
) {
  function Picker({
    value,
    onChange,
    disabled,
    renderOption,
    renderValue,
    staticOptions,
    filterFn,
  }: PickerProps<T>) {
    const overrides: UseEntityPickerOverrides<T> = { staticOptions, filterFn }
    const p = useEntityPicker(config, value, onChange, overrides)

    return (
      <>
        <AutoComplete<T>
          options={p.options}
          value={value}
          loading={p.isFetching}
          disabled={disabled}
          filterFn={p.filterFn}
          onSearch={p.setSearch}
          onChange={onChange}
          onCreateNew={p.canCreate ? p.triggerCreate : undefined}
          getOptionValue={config.getOptionValue}
          renderOption={renderOption ?? config.renderOption}
          renderValue={renderValue ?? config.renderValue}
          label={config.label}
        />

        {config.CreateForm && (
          <Dialog
            open={p.createDialog.open}
            onOpenChange={p.createDialog.setOpen}
          >
            <DialogContent>
              <config.CreateForm
                prefill={p.createDialog.prefill}
                submitting={p.createDialog.submitting}
                onCreated={p.createDialog.submit}
              />
            </DialogContent>
          </Dialog>
        )}
      </>
    )
  }

  function PickerField<TFieldValues extends FieldValues>({
    name,
    control,
    label,
    description,
    disabled,
    renderOption,
    renderValue,
    staticOptions,
    filterFn,
    onChange,
  }: {
    name: FieldPath<TFieldValues>
    control: Control<TFieldValues>
    label?: string
    description?: string
    disabled?: boolean
    onChange?: (value: T | null | undefined) => void
    renderOption?: (item: T, selected: boolean) => React.ReactNode
    renderValue?: (item: T) => React.ReactNode
    staticOptions?: T[] | (() => Promise<T[]>)
    filterFn?: (option: T, query: string) => boolean
  }) {
    const { field, fieldState } = useController({ name, control })

    return (
      <Field data-invalid={fieldState.invalid}>
        {label && (
          <FieldLabel htmlFor={field.name}>
            {label}
            <RequiredLabelIcon />
          </FieldLabel>
        )}
        <Picker
          value={field.value}
          onChange={(val) => {
            field.onChange(val ? config.getOptionValue(val) : null) // stores string
            field.onBlur()
            onChange?.(val)
          }}
          disabled={disabled}
          renderOption={renderOption}
          renderValue={renderValue}
          staticOptions={staticOptions}
          filterFn={filterFn}
        />
        {description && <FieldDescription>{description}</FieldDescription>}
        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
      </Field>
    )
  }

  return {
    Picker,
    PickerField,
    /** config-bound headless hook, for custom UI beyond AutoComplete */
    usePicker: (
      value: T | string | null | undefined,
      onChange: (v: T | null) => void,
      overrides?: UseEntityPickerOverrides<T>
    ) => useEntityPicker(config, value, onChange, overrides),
  }
}
