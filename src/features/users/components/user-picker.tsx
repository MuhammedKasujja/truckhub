import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { SystemUser } from "../types"
import { useQuery } from "@tanstack/react-query"
import { usersQueryOprions } from "../query-options"
import { useEffect, useMemo, useState } from "react"
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

function UserPickerWithFetcher({
  value, // User | string | null — mirrors AutoComplete's own contract
  onChange,
}: {
  value: SystemUser | string | null
  onChange: (user: SystemUser | null) => void
}) {
  const [search, setSearch] = useState("")

  // TODO: for form integration we need to consider using the defaultValue prop instead of value, and onChange to setValue.
  //  This is because the form may not have a value yet, and we need to be able to set the value when the user selects an option.
  //  We also need to consider how to handle the case where the user types in a value that is not in the options list.
  //  We may want to allow the user to create a new user in that case.

  const idToResolve = typeof value === "string" ? value : null

  const { data: resolvedUser } = useQuery({
    queryKey: ["user", idToResolve],
    queryFn: () => api.getUser(idToResolve!),
    enabled: !!idToResolve,
    staleTime: 5 * 60 * 1000,
  })

  // once resolution succeeds, promote parent state from bare id -> full object
  useEffect(() => {
    if (
      resolvedUser &&
      typeof value === "string" &&
      value === resolvedUser.id
    ) {
      onChange(resolvedUser)
    }
    // deliberately narrow deps: only re-run when the resolved data itself changes,
    // not on every `value`/`onChange` identity change from the parent re-rendering
  }, [resolvedUser]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: searchResults = [], isFetching } = useQuery({
    queryKey: ["users", "search", search],
    queryFn: () => api.searchUsers(search),
    enabled: search.length > 0,
  })


  const mergedOptions = useMemo(() => {
    if (!resolvedUser || search.length > 0) return searchResults
    const alreadyPresent = searchResults.some((u) => u.id === resolvedUser.id)
    return alreadyPresent ? searchResults : [resolvedUser, ...searchResults]
  }, [searchResults, resolvedUser, search])

  return (
    <AutoComplete<SystemUser>
      options={mergedOptions}
      value={value}
      loading={isFetching}
      onSearch={setSearch}
      onChange={onChange}
      getOptionValue={(u) => u.id}
      renderOption={(u) => u.name}
      label="User"
    />
  )
}
