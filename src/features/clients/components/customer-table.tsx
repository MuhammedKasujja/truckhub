"use client"

import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { useMemo, useState } from "react"
import { getClientsTableColumns } from "./clients-table-columns"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useSuspenseQuery } from "@tanstack/react-query"
import { clientsQueryOptions } from "../query-options"
import { useSearch } from "@tanstack/react-router"
import { useTranslation } from "@/i18n"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function CustomerTable() {
  // const [{ data, error, pagination }] = React.use(props.promises);
  const search = useSearch({ from: "/_admin/clients/" })
  // const [clientType, setClientType] = useState("normal")

  const { data: response, error } = useSuspenseQuery(
    clientsQueryOptions(search)
  )
  const tr = useTranslation()
  const columns = useMemo(() => getClientsTableColumns(tr), [tr])
  const { data, pagination } = response

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
      {/* <Select
        value={clientType}
        onValueChange={(v) => {
          setClientType(v)
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {["normal", "premium"].map((b) => (
            <SelectItem key={b} value={b}>
              {b}
            </SelectItem>
          ))}
        </SelectContent>
      </Select> */}
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} align="end" />
        </DataTableToolbar>
      </DataTable>
    </>
  )
}

export function CustomerTableSkeleton() {
  return <DataTableSkeleton columnCount={5} filterCount={1} shrinkZero />
}
