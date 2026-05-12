"use client"

import React from "react"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { getDriveTrainColumns } from "./drive-train-table-columns"
import { DriveTrainForm } from "./drive-train-form"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createDriveTrainsListQueryOptions } from "../query-options"
import { useSearch } from "@tanstack/react-router"


export function DriveTrainTable() {
  const search = useSearch({
    from: "/_admin/settings/_vehicle-config/drive-trains/",
  })
  const {
    data: { data, error },
  } = useSuspenseQuery(createDriveTrainsListQueryOptions(search))
  const columns = React.useMemo(() => getDriveTrainColumns(), [])

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
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <DriveTrainForm />
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  )
}

export function DriveTrainTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getDriveTrainColumns().length}
      filterCount={1}
      shrinkZero
    />
  )
}
