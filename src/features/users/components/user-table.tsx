"use client"

import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import React from "react"
import { getUserTableColumns } from "./user-table-columns"
import { Button } from "@/components/ui/button"
import { Link, useSearch } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { Can } from "@/components/has-permission"
import { useSuspenseQuery } from "@tanstack/react-query"
import { usersQueryOprions } from "../query-options"

export function UserTable() {
  const search = useSearch({ from: "/_admin/users/" })
  const response = useSuspenseQuery(usersQueryOprions(search))
  const { data, error, pagination } = response.data

  const columns = React.useMemo(() => getUserTableColumns(), [])

  useFetchEror(error)

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pagination.totalPages,
    initialState: {
      sorting: [{ id: "id", desc: true }],
      //   columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <Can permission="users:create">
          <Button asChild>
            <Link to={"/users/new"}>
              <PlusIcon />
              Add User
            </Link>
          </Button>
        </Can>
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  )
}

export function UserTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getUserTableColumns().length}
      filterCount={1}
      shrinkZero
    />
  )
}
