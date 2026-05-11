"use client"

import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import React from "react"
import { getVehicleTableColumns } from "./vehicle-table-columns"
import { Button } from "@/components/ui/button"
import { Link, useSearch } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { HasPermission } from "@/components/has-permission"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createVehiclesListQueryOptions } from "../query-options"

export function VehicleTable() {
  const search = useSearch({ from: "/_admin/vehicles/" })
  const {
    data: { data, error, pagination },
  } = useSuspenseQuery(createVehiclesListQueryOptions(search))
  const columns = React.useMemo(() => getVehicleTableColumns(), [])

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
        <HasPermission permission={"vehicles:create"}>
          <Button asChild>
            <Link to={"/vehicles/new"}>
              <PlusIcon />
              New Vehicle
            </Link>
          </Button>
        </HasPermission>
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  )
}

export function VehicleTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getVehicleTableColumns().length}
      filterCount={1}
      shrinkZero
    />
  )
}
