"use client"

import { Driver } from "../types"
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
}: EntityPickerProps<Driver>) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery({
    ...createDriverSearchQueryOptions(query),
    // enabled: query.trim().length > 2,
  })
  return (
    <AutoComplete<Driver>
      id={id}
      options={data ?? []}
      loading={isLoading}
      value={value}
      onChange={(driver) => {
        onSelected?.(driver)
      }}
      filterFn={(u, q) => u.fullname.toLowerCase().includes(q.toLowerCase())}
      label="Driver"
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.fullname}</span>}
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
}: FormAutoCompleteProps<TFieldValues, Driver>) {
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
      filterFn={(u, q) => u.fullname.toLowerCase().includes(q.toLowerCase())}
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.fullname}</span>}
      onSelected={onSelected}
      {...props}
    />
  )
}
