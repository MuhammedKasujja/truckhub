import { VehicleType } from "../types"
import { EntityPickerProps } from "@/common/types"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { FieldValues } from "react-hook-form"
import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { useVehicleConfigurationsQuery } from "../../hooks/use-vehicle-configurations"

export function VehicleCategoryPicker({
  value,
  id,
  onSelected,
}: EntityPickerProps<VehicleType>) {
  const { data: vehicleCofig, isLoading } = useVehicleConfigurationsQuery()
  return (
    <AutoComplete<VehicleType>
      id={id}
      options={vehicleCofig?.vehicle_types ?? []}
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

export function VehicleCategoryPickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  ...props
}: FormAutoCompleteProps<TFieldValues, VehicleType>) {
  //  const [query, setQuery] = useState("")
  const { data: vehicleCofig, isLoading } = useVehicleConfigurationsQuery()
  return (
    <FormAutoComplete
      name={name}
      loading={isLoading}
      description={description}
      options={vehicleCofig?.vehicle_types ?? []}
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
