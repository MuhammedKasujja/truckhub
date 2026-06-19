import { AutoComplete } from "@/components/ui/autocomplete-modified"
import { SystemUser } from "../types"
import { useQuery } from "@tanstack/react-query"
import { usersQueryOprions } from "../query-options"
import { useState } from "react"

type UserPickerProps = {
  id?: string
  value?: SystemUser
  label?: string
  placeholder?: string
  disabled?: boolean
  /** Switch to remote API search instead of local filter */
  remote?: boolean
  /** Min chars before triggering remote search */
  minSearchLength?: number
}

export function UserPicker({ value, id }: UserPickerProps) {
  const [query, setQuery] = useState("")
  const { data, isLoading } = useQuery(usersQueryOprions({}))
  const [selectedUser, setSelectedUser] = useState(value)
  return (
    <AutoComplete<SystemUser>
      id={id}
      options={data?.data ?? []}
      loading={isLoading}
      value={selectedUser}
      onChange={(user) => {
        setSelectedUser(user)
      }}
      filterFn={(u, q) => u.name.toLowerCase().includes(q.toLowerCase())}
      label="User"
      getOptionValue={(u) => u.id}
      renderOption={(u) => <span>{u.name}</span>}
    />
  )
}
