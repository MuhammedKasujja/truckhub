import { useState } from "react"
import { EntityPickerProps } from "@/common/types"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { FieldValues } from "react-hook-form"
import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { CarModel } from "../types"
import { useVehicleConfigurationsQuery } from "../../hooks/use-vehicle-configurations"

export function CarModelPicker({
  value,
  id,
  onSelected,
}: EntityPickerProps<CarModel>) {
  //   const [query, setQuery] = useState("")
  const { data: vehicleCofig, isLoading } = useVehicleConfigurationsQuery()
  return (
    <AutoComplete<CarModel>
      id={id}
      options={vehicleCofig?.car_models ?? []}
      loading={isLoading}
      value={value}
      onChange={(driver) => {
        onSelected?.(driver)
      }}
      filterFn={(u, q) => u.name.toLowerCase().includes(q.toLowerCase())}
      label="Car Model"
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.name}</span>}
    />
  )
}

export function CarModelPickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  ...props
}: FormAutoCompleteProps<TFieldValues, CarModel>) {
  //   const [query, setQuery] = useState("")
  const { data, isLoading } = useVehicleConfigurationsQuery()
  return (
    <FormAutoComplete
      name={name}
      loading={isLoading}
      description={description}
      options={data?.car_models ?? []}
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
