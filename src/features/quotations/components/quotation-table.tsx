import { DataTable } from "@/components/data-table"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useTranslation } from "@/i18n"
import { useMemo } from "react"
import { getQuotationTableColumns } from "./quotation-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Quotation } from "../types"
import { Pagination } from "@/types"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"

interface QuotationTableProps {
  data: Quotation[] | undefined
  pagination: Pagination | undefined
}

export function QuotationTable({ data, pagination }: QuotationTableProps) {
  const tr = useTranslation()
  const columns = useMemo(() => getQuotationTableColumns({ tr }), [tr])

  const { table } = useDataTable({
    data: data ?? [],
    columns,
    pageCount: pagination?.totalPages ?? 1,
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
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  )
}

export function QuotationTableSkeleton() {
  return <DataTableSkeleton columnCount={6} filterCount={1} shrinkZero />
}