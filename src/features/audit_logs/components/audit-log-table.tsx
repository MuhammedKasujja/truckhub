"use client"

import React from "react"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useTranslation } from "@/i18n"
import { getAuditLogTableColumns } from "./audit-log-table-columns"
import { useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createAuditLogsQueryOptions } from "../query-options"

export function AuditLogTable() {
  const search = useSearch({ from: "/_admin/reports/audits/" })
  const {
    data: { data, error, pagination },
  } = useSuspenseQuery(createAuditLogsQueryOptions(search))
  const tr = useTranslation()
  const columns = React.useMemo(() => getAuditLogTableColumns(tr), [tr])

  useFetchEror(error)

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pagination.totalPages,
    initialState: {
      sorting: [{ id: "created_at", desc: true }],
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

export function AuditLogTableSkeleton() {
  return <DataTableSkeleton columnCount={6} filterCount={1} shrinkZero />
}
