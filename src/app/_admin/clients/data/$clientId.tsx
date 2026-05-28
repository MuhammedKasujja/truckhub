import { DataGrid } from "@/components/data-grid/data-grid"
import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { clientRoutePricingQueryOptions } from "@/features/clients/query-options"
import {
  RoutePricing,
  RoutePricingResponse,
  TonnageRange,
} from "@/features/settings/pricing/types"
import { useDataGrid } from "@/hooks/use-data-grid"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"

function bandLabel(band: TonnageRange): string {
  return `${band.min_tons}–${band.max_tons}T`
}

function priceKey(band: TonnageRange): `price__${string}` {
  return `price__${bandLabel(band)}`
}

export const Route = createFileRoute("/_admin/clients/data/$clientId")({
  component: RouteComponent,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      clientRoutePricingQueryOptions(params.clientId)
    ),
  pendingComponent: () => <div>Loading...</div>,
})

function RouteComponent() {
  const { data, isLoading } = useQuery(
    clientRoutePricingQueryOptions(Route.useParams().clientId)
  )

  if (isLoading || !data) return <div>Loading data</div>

  const pricings = data?.data ?? ({} as RoutePricingResponse)

  const columns = useMemo<ColumnDef<RoutePricing>[]>(() => {
    const mainCols: ColumnDef<RoutePricing>[] = [
      getDataGridSelectColumn<RoutePricing>(),
      {
        id: "destination",
        accessorKey: "destination",
        header: "Destination",
        minSize: 160,
        enablePinning: false,
        enableHiding: false,
        meta: {
          readOnly: true,
        },
      },
      {
        id: "distance_km",
        accessorKey: "distance_km",
        header: "Distance (km)",
        minSize: 120,
        enableSorting: false,
        enablePinning: false,
        enableHiding: false,
        meta: {
          readOnly: true,
        },
      },
    ]

    const tonnageRangesCols: ColumnDef<RoutePricing>[] = (
      pricings.tonnages ?? []
    ).map((ton) => ({
      id: priceKey(ton),
      header: bandLabel(ton),
      meta: {
        cell: {
          variant: "custom",
          render: ({ row }) => {
            const data = row.original
            const pricing = data.pricings.find(
              (ele) =>
                ele.min_tons === ton.min_tons && ele.max_tons === ton.max_tons
            )
            return (
              <div className="size-full px-2 text-start text-sm outline-none">
                {pricing?.price}
              </div>
            )
          },
        },
      },
      enableSorting: false,
      enablePinning: false,
      enableHiding: false,
    }))

    const timeRangeCol: ColumnDef<RoutePricing>[] = [
      {
        id: "period",
        header: "Period",
        enableSorting: false,
        enablePinning: false,
        enableHiding: false,
        meta: {
          cell: {
            variant: "custom",
            render: ({ row }) => (
              <div className="size-full text-start text-sm outline-none">
                {row.original.min_hrs}-{row.original.max_hrs}HRS
              </div>
            ),
          },
        },
      },
    ]

    return [...mainCols, ...tonnageRangesCols, ...timeRangeCol]
  }, [])

  const { table, ...dataGridProps } = useDataGrid({
    columns,
    data: pricings.routes,
    getRowId: (row) => row.route_id.toString(),
    readOnly: true,
    defaultColumn: {
      size: 130,
      minSize: 110,
      maxSize: 400,
    },
    initialState: {
      columnPinning: {
        left: ["select"],
      },
      columnVisibility: {
        select: false,
      },
    },
    enableSearch: true,
  })

  const patchedColumnSizeVars = useMemo(() => {
    const vars: Record<string, number> = {
      ...(dataGridProps.columnSizeVars as Record<string, number>),
    }
    for (const header of table.getFlatHeaders()) {
      const headerVar = `--header-${header.id}-size`
      const colVar = `--col-${header.column.id}-size`
      if (!(headerVar in vars)) vars[headerVar] = header.getSize()
      if (!(colVar in vars)) vars[colVar] = header.column.getSize()
    }
    return vars
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataGridProps.columnSizeVars, pricings])

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div>Route Pricings</div>
      </div>
      <Button variant={"secondary"}>{pricings.effective_date}</Button>
      <Card>
        <CardContent>
          <DataGrid
            table={table}
            {...dataGridProps}
            columnSizeVars={patchedColumnSizeVars}
            height={800}
            stretchColumns={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
