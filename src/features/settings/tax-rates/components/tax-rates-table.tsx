import React from "react"
import { useTaxRatesSuspense } from "../hooks/use-tax-rates"
import { getTaxRateColumns } from "./tax-rates-table-columns"
import type { TaxRate } from "../types"
import type { EntityId } from "@/schemas"
import { DataTable } from "@/components/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { useDataTable } from "@/hooks/use-data-table"
import { useFetchEror } from "@/hooks/use-fetch-error"

type TaxRatesTableProps = {
  defaultTaxRateId?: EntityId | null
  onMakeDefault?: (taxRate: TaxRate) => void
}

export function TaxRatesTable({
  defaultTaxRateId,
  onMakeDefault,
}: TaxRatesTableProps) {
  const { data, error } = useTaxRatesSuspense()
  const columns = React.useMemo(
    () => getTaxRateColumns({ defaultTaxRateId, onMakeDefault }),
    [defaultTaxRateId, onMakeDefault]
  )

  useFetchEror(error)

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    getRowId: (originalRow) => originalRow.id.toString(),
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <DataTable
      table={table}
      showPagination={false}
      // Sits flush inside a section card, so drop the table's own frame.
      className="[&>div]:rounded-none [&>div]:border-0"
    />
  )
}

export function TaxRateTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getTaxRateColumns().length}
      filterCount={0}
      shrinkZero
    />
  )
}
