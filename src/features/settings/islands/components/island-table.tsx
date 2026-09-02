import React from "react"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { getCarBrandColumns } from "./island-table-columns"
import { CarBrandForm } from "./island-edit-form"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createCarBrandsQueryOptions } from "../query-options"
import { useSearch } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"

export function CarBrandTable() {
  const search = useSearch({
    from: "/_admin/settings/vehicle-config/car-brands/",
  })
  const {
    data: { data, error },
  } = useSuspenseQuery(createCarBrandsQueryOptions(search))
  const columns = React.useMemo(() => getCarBrandColumns(), [])

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
          <CarBrandForm />
        </Can>
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  )
}

export function CarBrandTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getCarBrandColumns().length}
      filterCount={1}
      shrinkZero
    />
  )
}
