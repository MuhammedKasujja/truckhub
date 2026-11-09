"use client"

import { useMemo } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { UsersIcon } from "lucide-react"
import { createDriverListQueryOptions } from "../queries"
import { DriverCard, DriverCardSkeleton } from "./driver-card"
import { getDriverTableColumns } from "./driver-table-columns"
import type {ListView} from "@/components/view-toggle";
import { DataTable } from "@/components/data-table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {  ViewToggle } from "@/components/view-toggle"
import { useDataTable } from "@/hooks/use-data-table"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useTranslation } from "@/i18n"
import { formatPlural } from "@/lib/format"

const DRIVER_WORDS = { singular: "driver", plural: "drivers" }

/** Drivers as a card grid or a table; both share search, sort and paging. */
export function DriverList() {
  const search = useSearch({ from: "/_admin/drivers/" })
  const {
    data: { data, pagination },
    error,
  } = useSuspenseQuery(createDriverListQueryOptions(search))
  useFetchEror(error)

  const tr = useTranslation()
  const columns = useMemo(() => getDriverTableColumns(tr), [tr])

  const view: ListView = search.view ?? "cards"
  const navigate = useNavigate({ from: "/drivers/" })
  const setView = (next: ListView) =>
    navigate({
      // Cards is the default, so it stays out of the URL.
      search: (prev) => ({ ...prev, view: next === "cards" ? undefined : next }),
      replace: true,
    })

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pagination.totalPages,
    initialState: {
      sorting: [{ id: "created_at", desc: true }],
    },
    getRowId: (row) => row.id.toString(),
    shallow: false,
    clearOnDefault: true,
  })

  const toolbar = (
    <DataTableToolbar table={table} showColumnFilter={view === "table"}>
      <DataTableSortList table={table} align="end" />
      <ViewToggle value={view} onChange={setView} />
    </DataTableToolbar>
  )

  if (view === "table") {
    return <DataTable table={table}>{toolbar}</DataTable>
  }

  const rows = table.getRowModel().rows

  return (
    <div className="flex w-full flex-col gap-2.5">
      {toolbar}
      <p className="px-1 text-xs text-muted-foreground">
        {formatPlural(pagination.total, DRIVER_WORDS)}
      </p>
      {rows.length === 0 ? (
        <Empty className="h-56 border border-dashed bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>
              {search.search ? "No drivers match" : "No drivers yet"}
            </EmptyTitle>
            <EmptyDescription>
              {search.search
                ? "Try a different name, email or phone number."
                : "Drivers you register will show up here."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {rows.map((row) => (
            <DriverCard key={row.id} driver={row.original} />
          ))}
        </div>
      )}
      <DataTablePagination table={table} />
    </div>
  )
}

export function DriverListSkeleton() {
  return (
    <div className="flex w-full flex-col gap-2.5" aria-busy="true">
      <div className="flex justify-between gap-2 p-1">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DriverCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
