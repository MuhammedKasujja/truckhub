import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { FieldValues } from "react-hook-form"
import { EntityPickerProps } from "@/common/types"
import { Booking } from "../types"
import { bookingsListSearchQueryOptions } from "../queries-options"

export function BookingPicker({
  value,
  id,
  remote,
  onSelected,
}: EntityPickerProps<Booking>) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery(
    bookingsListSearchQueryOptions(remote ? { search: query } : {})
  )
  return (
    <AutoComplete<Booking>
      id={id}
      options={data?.data ?? []}
      loading={isLoading}
      value={value}
      onChange={(booking) => {
        onSelected?.(booking)
      }}
      onSearch={(q) => setQuery(q)}
      filterFn={(u, q) => u.number.toLowerCase().includes(q.toLowerCase())}
      label="Booking"
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.number}</span>}
    />
  )
}

export function BookingPickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  ...props
}: FormAutoCompleteProps<TFieldValues, Booking>) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery(
    bookingsListSearchQueryOptions(remote ? { search: query } : {})
  )
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
      filterFn={(b, q) => b.number.toLowerCase().includes(q.toLowerCase())}
      getOptionValue={(b) => b.id}
      renderOption={(u) => <span>{u.number}</span>}
      onSelected={onSelected}
      {...props}
    />
  )
}
