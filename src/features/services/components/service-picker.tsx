import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { FieldValues } from "react-hook-form"
import { EntityPickerProps } from "@/common/types"
import { Service } from "../types"
import { servicesSearchQueryOptions } from "../query-options"
import { formatMoney } from "@/lib/format"

export function ServicePicker({
  value,
  id,
  remote,
  onSelected,
  label,
}: EntityPickerProps<Service>) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery(servicesSearchQueryOptions())
  return (
    <AutoComplete<Service>
      id={id}
      options={data?.data ?? []}
      loading={isLoading}
      value={value}
      onChange={(booking) => {
        onSelected?.(booking)
      }}
      onSearch={(q) => setQuery(q)}
      filterFn={(s, q) => s.name.toLowerCase().includes(q.toLowerCase())}
      label={label}
      getOptionValue={(s) => s.id}
      renderOption={(s) => (
        <p>
          {s.name}
          <span className="ml-2 text-muted-foreground">
            ({formatMoney(s.base_fare)})
          </span>
        </p>
      )}
    />
  )
}

export function ServicePickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  ...props
}: FormAutoCompleteProps<TFieldValues, Service>) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery(servicesSearchQueryOptions())
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
      filterFn={(s, q) => s.name.toLowerCase().includes(q.toLowerCase())}
      getOptionValue={(s) => s.id}
      renderOption={(s) => (
        <p>
          {s.name}
          <span className="ml-2 text-muted-foreground">
            ({formatMoney(s.base_fare)})
          </span>
        </p>
      )}
      onSelected={onSelected}
      {...props}
    />
  )
}
