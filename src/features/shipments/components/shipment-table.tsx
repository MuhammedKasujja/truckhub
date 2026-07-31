import { DataTable } from "@/components/data-table"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useTranslation } from "@/i18n"
import { useMemo, useState } from "react"
import { getShipmentTableColumns } from "./shipment-table-columns"
import { useDataTable } from "@/hooks/use-data-table"
import { Shipment, ShipmentTableRowAction } from "../types"
import { Pagination } from "@/types"

interface ShipmentTableProps {
  data: Shipment[] | undefined
  pagination: Pagination | undefined
}

export function ShipmentTable({ data, pagination }: ShipmentTableProps) {
  const tr = useTranslation()
  const [rowAction, setRowAction] = useState<ShipmentTableRowAction | null>(
    null
  )
  const columns = useMemo(
    () => getShipmentTableColumns({ tr, setRowAction }),
    [tr, setRowAction]
  )

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
