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
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createAuditLogsQueryOptions } from "../query-options"
import { UserPicker } from "@/features/users/components/user-picker"
import { Label } from "@/components/ui/label"

export function AuditLogTable() {
  const search = useSearch({ from: "/_admin/reports/audits/" })
  const navigate = useNavigate({ from: "/reports/audits/" })
  const {
    data: { data, pagination },
    error,
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
    <div className="space-y-4">
      <div className="space-y-4 max-w-72">
        <Label htmlFor="user">User</Label>
        <UserPicker
          id="user"
          placeholder="filter by user"
          value={search.user_ids?.at(0)}
          onSelected={(user) =>
            navigate({
              search: (prev) => ({
                ...prev,
                user_ids: user?.id ? [user?.id] : undefined,
                page: 1,
              }),
            })
          }
        />
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="end" />
        </DataTableToolbar>
      </DataTable>
    </div>
  )
}

export function AuditLogTableSkeleton() {
  return <DataTableSkeleton columnCount={6} filterCount={1} shrinkZero rowCount={25} />
}
