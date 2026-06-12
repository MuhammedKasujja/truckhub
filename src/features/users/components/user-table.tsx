"use client"

import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import React from "react"
import { getUserTableColumns } from "./user-table-columns"
import { Button } from "@/components/ui/button"
import { Link, useSearch } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { Can } from "@/components/has-permission"
import { useSuspenseQuery } from "@tanstack/react-query"
import { usersQueryOprions } from "../query-options"
import { UserDataTableRowAction } from "../types"
import { UserAssignRolesDialog } from "./user-assign-roles-dialog"
import { useTranslation } from "@/i18n"

export function UserTable() {
  const search = useSearch({ from: "/_admin/settings/user-management/users/" })
  const {
    data: { data, pagination },
    error,
  } = useSuspenseQuery(usersQueryOprions(search))

  const tr = useTranslation()

  const [rowAction, setRowAction] =
    React.useState<UserDataTableRowAction | null>(null)

  const columns = React.useMemo(
    () => getUserTableColumns({ setRowAction, tr }),
    [tr]
  )

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
    <>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Can permission="users:create">
            <Button asChild>
              <Link to={"/settings/user-management/users/new"}>
                <PlusIcon />
                Add User
              </Link>
            </Button>
          </Can>
          <DataTableSortList table={table} align="end" />
        </DataTableToolbar>
      </DataTable>
      {/* Assign User roles  Dialog */}
      <UserAssignRolesDialog
        key={rowAction?.row.original.id} // Force rebuild whenever the user changes
        user={rowAction?.row.original}
        open={rowAction?.variant === "assign-permissions"}
        onOpenChange={() => setRowAction(null)}
      />
    </>
  )
}

export function UserTableSkeleton() {
  return <DataTableSkeleton columnCount={5} filterCount={1} shrinkZero />
}
