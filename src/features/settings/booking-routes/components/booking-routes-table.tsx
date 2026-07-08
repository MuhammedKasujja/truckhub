"use client"

import React, { useState } from "react"
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
import { Can } from "@/components/has-permission"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { BookingRouteTableActions } from "./booking-route-table-actions"
import { BookingRouteTableRowAction } from "../types"
import { useTranslation } from "@/i18n"

export function BookingRoutesTable() {
  const tr = useTranslation()
  const {
    data: { data, error },
  } = useSuspenseQuery(bookingRoutesQueryOptions())
  const [open, setOpen] = useState(false)

  const [rowAction, setRowAction] = useState<BookingRouteTableRowAction | null>(
    null
  )

  const columns = React.useMemo(
    () => getBookingRoutesColumns({ tr, setRowAction }),
    [tr]
  )

  useFetchEror(error)

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "id", desc: true }],
      //   columnPinning: { right: ["actions"] },
      columnVisibility: {
        id: false,
        origin: false,
      },
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable table={table} showPagination={false}>
        <DataTableToolbar table={table}>
          <Can permission="config:routes:create">
            <Button
              size="sm"
              className="font-normal"
              onClick={() => setOpen(true)}
            >
              <PlusIcon />
              Route
            </Button>
          </Can>
          <RouteEditForm
            key={"create-booking"}
            open={open}
            onOpenChange={() => setOpen(false)}
          />
          <DataTableSortList table={table} align="end" />
        </DataTableToolbar>
      </DataTable>
      <BookingRouteTableActions
        setRowAction={setRowAction}
        rowAction={rowAction}
      />
    </>
  )
}

export function BookingRoutesTableSkeleton() {
  return <DataTableSkeleton columnCount={5} filterCount={1} shrinkZero />
}
