"use client"

import React from "react"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { getCarModelColumns } from "./car-model-table-columns"
import { CarModelForm } from "./car-brand-form"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createCarModelsListQueryOptions } from "../query-options"
import { useSearch } from "@tanstack/react-router"

export function CarModelTable() {
  const search = useSearch({
    from: "/_admin/settings/_vehicle-config/car-models/",
  })
  const {
    data: { data: carModels, error },
  } = useSuspenseQuery(createCarModelsListQueryOptions(search))

  useFetchEror(error)

  const columns = React.useMemo(() => getCarModelColumns(), [])

  const { table } = useDataTable({
    data: carModels,
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
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <CarModelForm />
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  )
}

export function CarModelTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getCarModelColumns().length}
      filterCount={1}
      shrinkZero
    />
  )
}
