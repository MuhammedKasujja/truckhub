import { IslandPricingItem } from "../../types"
import { ColumnDef } from "@tanstack/react-table"
import { useDataTable } from "@/hooks/use-data-table"
import { DataTable } from "@/components/data-table"
import { formatMoney } from "@/lib/format"

interface IslandsPricingTableProp {
  pricings?: IslandPricingItem[]
}

const columns: ColumnDef<IslandPricingItem>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Island Name",
    minSize: 100,
    enablePinning: false,
    enableHiding: false,
    cell: ({ row }) => {
      const name = row.original.name
      return <div className="font-semibold items-start justify-items-start">{name}</div>
    },
  },
  {
    id: "locations",
    accessorKey: "locations",
    header: "Locations",
    minSize: 160,
    enablePinning: false,
    enableHiding: false,
    cell: ({ row }) => {
      const locations = row.original.locations
      return (
        <div className="text-muted-foreground">
          {locations.map((loc) => (
            <div key={loc}>{loc}</div>
          ))}
        </div>
      )
    },
  },
  {
    id: "price",
    accessorKey: "general_price",
    header: "Price",
    minSize: 160,
    enablePinning: false,
    enableHiding: false,
    cell: ({ row }) => {
      const price = row.original.general_price
      return <div className="font-semibold">{formatMoney(price)}</div>
    },
  },
]

export function IslandPricingTable({ pricings }: IslandsPricingTableProp) {
  const { table } = useDataTable({
    data: pricings!,
    columns,
    // getRowId: (row) => row.id,
    enableSearch: true,
    enablePaste: true,
    defaultColumn: {
      size: 130,
      minSize: 110,
      maxSize: 400,
    },
    initialState: {
      columnPinning: {
        left: ["name"],
      },
      columnVisibility: {
        select: false,
        origin: false,
      },
    },
  })

  return <DataTable table={table} showPagination={false} />
}
