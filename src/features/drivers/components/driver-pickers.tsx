import { DriverSummary } from "../types"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createDriverSearchQueryOptions } from "../queries"
import { EntityPickerProps } from "@/common/types"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { FieldValues } from "react-hook-form"
import { AutoComplete } from "@/components/ui/autocomplete-modified"

export function DriverPicker({
  value,
  id,
  onSelected,
}: EntityPickerProps<DriverSummary>) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery({
    ...createDriverSearchQueryOptions(query),
    // enabled: query.trim().length > 2,
  })
  return (
    <AutoComplete<DriverSummary>
      id={id}
      options={data ?? []}
      loading={isLoading}
      value={value}
      onChange={(driver) => {
        onSelected?.(driver)
      }}
      filterFn={(u, q) => u.full_name.toLowerCase().includes(q.toLowerCase())}
      label="Driver"
      getOptionValue={(u) => u.id}
      renderOption={(u) => (
        <div>
          <div>{u.full_name}</div>
          <div className="text-muted-foreground">{u.phone}</div>
        </div>
      )}
      renderValue={(u) => (
        <div>
          <div>{u.full_name}</div>
        </div>
      )}
    />
  )
}

export function DriverPickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  ...props
}: FormAutoCompleteProps<TFieldValues, DriverSummary>) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery(createDriverSearchQueryOptions(query))
  return (
    <FormAutoComplete
      name={name}
      loading={isLoading}
      description={description}
      options={data ?? []}
      control={control}
      label={label}
      remote={remote}
      onSearch={(q) => setQuery(q)}
      filterFn={(u, q) => u.full_name.toLowerCase().includes(q.toLowerCase())}
      getOptionValue={(u) => u.id}
      renderValue={(u)=> <div>{u.full_name}</div>}
      renderOption={(u) => (
        <div className="space-y-0.5">
          <div>{u.full_name}</div>
          <div className="text-muted-foreground">{u.phone}</div>
        </div>
      )}
      onSelected={onSelected}
      {...props}
    />
  )
}
