"use client"

import React from "react"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getBookingRoutesColumns } from "./booking-route-table-columns"
import { bookingRoutesQueryOptions } from "../query-options"
import { RouteEditForm } from "./route-edit-form"

export function BookingRoutesTable() {
  const {
    data: { data, error },
  } = useSuspenseQuery(bookingRoutesQueryOptions())
  const columns = React.useMemo(() => getBookingRoutesColumns(), [])

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
        <RouteEditForm />
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  )
}

export function BookingRoutesTableSkeleton() {
  return <DataTableSkeleton columnCount={5} filterCount={1} shrinkZero />
}
