import React from "react"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { getTaxRateColumns } from "./tax-rates-table-columns"
import { TaxRateForm } from "./tax-rate-form"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useTaxRatesSuspense } from "../hooks/use-tax-rates"

export function TaxRatesTable() {
  const { data, error } = useTaxRatesSuspense()
  const columns = React.useMemo(() => getTaxRateColumns(), [])

  useFetchEror(error)

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "id", desc: true }],
      //   columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <div>
      <DataTableToolbar table={table}>
        <TaxRateForm />
      </DataTableToolbar>
      <DataTable table={table}></DataTable>
    </div>
  )
}

export function TaxRateTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getTaxRateColumns().length}
      filterCount={1}
      shrinkZero
    />
  )
}
