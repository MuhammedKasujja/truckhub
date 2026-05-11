"use client"

import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { useMemo } from "react"
import { getDriverTableColumns } from "./driver-table-columns"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createDriverListQueryOptions } from "../queries"
import { useSearch } from "@tanstack/react-router"

export function DriverTable() {
  const search = useSearch({ from: "/_admin/drivers/" })
  const {
    data: { data, error, pagination },
  } = useSuspenseQuery(createDriverListQueryOptions(search))
  const columns = useMemo(() => getDriverTableColumns(), [])

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
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  )
}

export function DriverTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getDriverTableColumns().length}
      filterCount={1}
      shrinkZero
    />
  )
}
