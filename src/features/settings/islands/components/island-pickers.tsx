import { Island } from "../types"
import { EntityPickerProps } from "@/common/types"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { FieldValues } from "react-hook-form"
import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { useVehicleConfigurationsQuery } from "../../hooks/use-vehicle-configurations"

export function CarBrandPicker({
  value,
  id,
  onSelected,
}: EntityPickerProps<Island>) {
  const { data: vehicleCofig, isLoading } = useVehicleConfigurationsQuery()
  return (
    <AutoComplete<Island>
      id={id}
      options={vehicleCofig?.car_brands ?? []}
      loading={isLoading}
      value={value}
      onChange={(driver) => {
        onSelected?.(driver)
      }}
      filterFn={(u, q) => u.name.toLowerCase().includes(q.toLowerCase())}
      label="Car Brand"
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.name}</span>}
    />
  )
}

export function CarBrandPickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  ...props
}: FormAutoCompleteProps<TFieldValues, Island>) {
  //  const [query, setQuery] = useState("")
  const { data: vehicleCofig, isLoading } = useVehicleConfigurationsQuery()
  return (
    <FormAutoComplete
      name={name}
      loading={isLoading}
      description={description}
      options={vehicleCofig?.car_brands ?? []}
      control={control}
      label={label}
      remote={remote}
      //   onSearch={(q) => setQuery(q)}
      filterFn={(u, q) => u.name.toLowerCase().includes(q.toLowerCase())}
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.name}</span>}
      onSelected={onSelected}
      {...props}
    />
  )
}
