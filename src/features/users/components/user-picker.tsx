import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { SystemUser } from "../types"
import { useQuery } from "@tanstack/react-query"
import { usersQueryOprions } from "../query-options"
import { useState } from "react"
import {
  FormAutoComplete,
  FormAutoCompleteProps,
} from "@/components/ui/form-fields/auto-complete-field/form-auto-complete"
import { FieldValues } from "react-hook-form"
import { EntityPickerProps } from "@/common/types"

export function UserPicker({
  value,
  id,
  onSelected,
}: EntityPickerProps<SystemUser>) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery(usersQueryOprions({}))
  return (
    <AutoComplete<SystemUser>
      id={id}
      options={data?.data ?? []}
      loading={isLoading}
      value={value}
      onChange={(user) => {
        onSelected?.(user)
      }}
      filterFn={(u, q) => u.name.toLowerCase().includes(q.toLowerCase())}
      label="User"
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.name}</span>}
    />
  )
}

export function UserPickerField<TFieldValues extends FieldValues>({
  name,
  onSelected,
  label,
  description,
  remote = false,
  control,
  ...props
}: FormAutoCompleteProps<TFieldValues, SystemUser>) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery(
    usersQueryOprions(remote ? { search: query } : {})
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
      filterFn={(u, q) => u.name.toLowerCase().includes(q.toLowerCase())}
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.name}</span>}
      onSelected={onSelected}
      {...props}
    />
  )
}
