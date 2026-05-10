"use client"

import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import React from "react"
import { getCustomerTableColumns } from "./customer-table-columns"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { clientsQueryOptions } from "../query-options"
import { useSearch } from "@tanstack/react-router"

export function CustomerTable() {
  // const [{ data, error, pagination }] = React.use(props.promises);
  const search = useSearch({ from: "/_admin/clients/" })

  const { data: response } = useSuspenseQuery(clientsQueryOptions(search))
  const columns = React.useMemo(() => getCustomerTableColumns(), [])
  const { data, error, pagination } = response

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

export function CustomerTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getCustomerTableColumns().length}
      filterCount={1}
      shrinkZero
    />
  )
}
