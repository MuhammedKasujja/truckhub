import { FieldValues } from "react-hook-form"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "./auto-complete-field/form-auto-complete"
import { ColorSwatch } from "../color-swatch"

interface Color {
  label: string
  colorCode: string
}

interface ColorPickerFieldProps<
  TFieldValues extends FieldValues,
> extends FormAutoCompleteProps<TFieldValues, Color> {
  options: Color[]
}

export function ColorPickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  options,
  ...props
}: ColorPickerFieldProps<TFieldValues>) {
  return (
    <FormAutoComplete
      name={name}
      description={description}
      options={options}
      control={control}
      label={label}
      remote={remote}
      filterFn={(c, q) => c.label.toLowerCase().includes(q.toLowerCase())}
      getOptionValue={(c) => c.colorCode}
      renderOption={(c) => (
        <div className="flex w-full gap-4">
          <ColorSwatch color={c.colorCode} size={"xs"} />
          {c.label}
        </div>
      )}
      onSelected={onSelected}
      {...props}
    />
  )
}
