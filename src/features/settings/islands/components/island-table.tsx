import React from "react"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { getIslandColumns } from "./island-table-columns"
import { IslandEditForm } from "./island-edit-form"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { islandsQueryOptions } from "../query-options"
import { Can } from "@/components/has-permission"

export function IslandsTable() {
  const {
    data: { data, error },
  } = useSuspenseQuery(
    islandsQueryOptions({
      search: "",
      perPage: 200,
    })
  )
  const columns = React.useMemo(() => getIslandColumns(), [])

  useFetchEror(error)

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "id", desc: true }],
      columnVisibility: {
        id: false,
      },
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <Can permission="config:car_brand:create">
          <IslandEditForm />
        </Can>
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  )
}

export function CarBrandTableSkeleton() {
  return <DataTableSkeleton columnCount={4} filterCount={1} shrinkZero />
}
