import { Vehicle } from "../types"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { EntityPickerProps } from "@/common/types"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { FieldValues } from "react-hook-form"
import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { vehicleSearchQueryOptions } from "../query-options"

export function VehiclePicker({
  value,
  id,
  onSelected,
}: EntityPickerProps<Vehicle>) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery({
    ...vehicleSearchQueryOptions(query),
    // enabled: query.trim().length > 2,
  })
  return (
    <AutoComplete<Vehicle>
      id={id}
      options={data?.data ?? []}
      loading={isLoading}
      value={value}
      onChange={(vehicle) => {
        onSelected?.(vehicle)
      }}
      filterFn={(u, q) =>
        u.display_name.toLowerCase().includes(q.toLowerCase())
      }
      label="Vehicle"
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.plate_number}</span>}
    />
  )
}

export function VehiclePickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  ...props
}: FormAutoCompleteProps<TFieldValues, Vehicle>) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery(vehicleSearchQueryOptions(query))
  return (
    <FormAutoComplete
      name={name}
      loading={isLoading}
      description={description}
      options={data?.data ?? []}
      control={control}
      label={label}
      remote={remote}
      onSearch={(q) => setQuery(q)}
      filterFn={(u, q) =>
        u.display_name.toLowerCase().includes(q.toLowerCase())
      }
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.plate_number}</span>}
      onSelected={onSelected}
      {...props}
    />
  )
}
