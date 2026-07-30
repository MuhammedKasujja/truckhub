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
      filterFn={(s, q) =>
        s.display_name.toLowerCase().includes(q.toLowerCase())
      }
      label={label}
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.display_name}</span>}
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
      filterFn={(b, q) =>
        b.display_name.toLowerCase().includes(q.toLowerCase())
      }
      getOptionValue={(b) => b.id}
      renderOption={(u) => <span>{u.display_name}</span>}
      onSelected={onSelected}
      {...props}
    />
  )
}
