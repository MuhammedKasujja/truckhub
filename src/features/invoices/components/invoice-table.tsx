import { DataTable } from "@/components/data-table"
// import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
// import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useTranslation } from "@/i18n"
import { useMemo, useState } from "react"
import { getInvoiceTableColumns } from "./invoice-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { useQuery } from "@tanstack/react-query"
import { invoiceQueryOptions } from "../query-options"
import { useSearch } from "@tanstack/react-router"
import { InvoiceTableRowAction } from "../types"
import { EnterPaymentModal } from "@/features/payments/components"

export function InvoiceTable() {
  const tr = useTranslation()
  const [rowAction, setRowAction] = useState<InvoiceTableRowAction | null>(null)

  const columns = useMemo(
    () => getInvoiceTableColumns({ tr, setRowAction }),
    [tr, setRowAction]
  )
  const search = useSearch({ from: "/_admin/billing/invoices/" })

  const { data } = useQuery(invoiceQueryOptions(search))

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
    <>
      <DataTable table={table}>
        {/* <DataTableToolbar table={table}> */}
        {/* <DataTableSortList table={table} align="end" /> */}
        {/* </DataTableToolbar> */}
      </DataTable>
      <EnterPaymentModal
        open={rowAction?.variant == "makePayment"}
        onOpenChange={() => setRowAction(null)}
        initialData={{
          entity_id: rowAction?.row.id,
          amount: rowAction?.row.original.balance_due ?? 0,
          type: "invoice",
        }}
      />
    </>
  )
}
