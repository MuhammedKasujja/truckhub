import { DataTable } from "@/components/data-table"
// import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
// import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useTranslation } from "@/i18n"
import { useMemo } from "react"
import { getInvoiceTableColumns } from "./invoice-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useQuery } from "@tanstack/react-query"
import { invoiceQueryOptions } from "../query-options"
import { useSearch } from "@tanstack/react-router"

export function InvoiceTable() {
  const tr = useTranslation()
  const columns = useMemo(() => getInvoiceTableColumns({ tr }), [tr])
  const search = useSearch({ from: "/_admin/billing/invoices/" })

  const { data, error } = useQuery(invoiceQueryOptions(search))

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns,
    pageCount: data?.pagination.totalPages ?? 1,
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
      {/* <DataTableToolbar table={table}> */}
      {/* <DataTableSortList table={table} align="end" /> */}
      {/* </DataTableToolbar> */}
    </DataTable>
  )
}
