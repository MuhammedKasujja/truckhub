"use client"

import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import React from "react"
import { getRideRequestTableColumns } from "./ride-request-table-columns"
import { Button } from "@/components/ui/button"
import { Link, useSearch } from "@tanstack/react-router"
import { MapIcon } from "lucide-react"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createRidesQueryOptions } from "../query-options"

export function RideRequestTable() {
  const search = useSearch({ from: "/_admin/rides/" })

  const {
    data: { data, error, pagination },
  } = useSuspenseQuery(createRidesQueryOptions(search))

  const columns = React.useMemo(() => getRideRequestTableColumns(), [])

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
        <Button size={"sm"} asChild>
          <Link to={"/rides/live"}>
            <MapIcon />
            Live
          </Link>
        </Button>
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  )
}

export function RideRequestTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getRideRequestTableColumns().length}
      filterCount={1}
      shrinkZero
    />
  )
}
