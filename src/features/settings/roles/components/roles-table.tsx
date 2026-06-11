import React from "react"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { useDataTable } from "@/hooks/use-data-table"
import { getRoleColumns } from "./roles-table-columns"
import { RoleEditForm } from "./role-edit-form"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createRolesQueryOptions } from "../query-options"
import { DataTableSearchInput } from "@/components/data-table/data-table-search-input"
import { Can } from "@/components/has-permission"

export function RolesTable() {
  const {
    data: { data, error },
  } = useSuspenseQuery(createRolesQueryOptions())
  const columns = React.useMemo(() => getRoleColumns(), [])

  useFetchEror(error)

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "id", desc: true }],
      //   columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-4">
        <DataTableSearchInput placeholder={"Search..."} table={table} />
        <Can permission={"config:roles:create"}>
          <RoleEditForm />
        </Can>
      </div>
      <DataTable table={table} showPagination={false}/>
    </div>
  )
}

export function RoleTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getRoleColumns().length}
      filterCount={1}
      shrinkZero
    />
  )
}
