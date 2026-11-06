import React, { useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createAuditLogsQueryOptions } from "../query-options"
import { getAuditLogTableColumns } from "./audit-log-table-columns"
import { AuditLogTableActions } from "./audit-log-table-actions"
import type { AuditLogTableRowAction } from "../types"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useTranslation } from "@/i18n"
import { UserPicker } from "@/features/users/components/user-picker"

export function AuditLogTable() {
  const search = useSearch({ from: "/_admin/reports/audits/" })
  const navigate = useNavigate({ from: "/reports/audits/" })
  const {
    data: { data, pagination },
    error,
  } = useSuspenseQuery(createAuditLogsQueryOptions(search))
  const tr = useTranslation()
  const [rowAction, setRowAction] = useState<AuditLogTableRowAction | null>(
    null
  )
  const columns = React.useMemo(
    () => getAuditLogTableColumns({ tr, setRowAction }),
    [tr]
  )

  useFetchEror(error)

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pagination.totalPages,
    initialState: {
      sorting: [{ id: "created_at", desc: true }],
      // Source is shown inside the actor cell; the column only powers the filter
      columnVisibility: { source: false },
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <div className="w-56">
            <UserPicker
              id="audit-user"
              value={search.user_ids?.at(0)}
              onSelected={(user) =>
                navigate({
                  search: (prev) => ({
                    ...prev,
                    user_ids: user?.id ? [user.id] : undefined,
                    page: 1,
                  }),
                })
              }
            />
          </div>
          <DataTableSortList table={table} align="end" />
        </DataTableToolbar>
      </DataTable>
      <AuditLogTableActions
        key={rowAction?.row.original.id}
        rowAction={rowAction}
        setRowAction={setRowAction}
      />
    </>
  )
}

export function AuditLogTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={6}
      filterCount={2}
      shrinkZero
      rowCount={12}
    />
  )
}
