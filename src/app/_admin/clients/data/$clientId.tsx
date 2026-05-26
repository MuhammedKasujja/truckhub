import { DataGrid } from "@/components/data-grid/data-grid"
import { getDataGridSelectColumn } from "@/components/data-grid/data-grid-select-column"
import { clientRoutePricingQueryOptions } from "@/features/clients/query-options"
import {
  RoutePricing,
  RoutePricingResponse,
} from "@/features/settings/pricing/types"
import { useDataGrid } from "@/hooks/use-data-grid"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"

export const Route = createFileRoute("/_admin/clients/data/$clientId")({
  component: RouteComponent,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      clientRoutePricingQueryOptions(params.clientId)
    ),
})

function RouteComponent() {
  const { data } = useQuery(
    clientRoutePricingQueryOptions(Route.useParams().clientId)
  )
  const pricings = data?.data ?? ({} as RoutePricingResponse)

  const columns = useMemo<ColumnDef<RoutePricing>[]>(() => {
    const mainCols: ColumnDef<RoutePricing>[] = [
      getDataGridSelectColumn<RoutePricing>(),
      {
        id: "origin",
        accessorKey: "origin",
        header: "Route name",
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
      id: `tonnages.${ton.min_tons}_${ton.max_tons}`,
      accessorKey: `tonnages.${ton.min_tons}_${ton.max_tons}`,
      header: `${ton.min_tons}-${ton.max_tons}T`,
      enableSorting: false,
      enablePinning: false,
      enableHiding: false,
    }))

    const periodCols: ColumnDef<RoutePricing>[] = [
      {
        id: "max_hrs",
        accessorKey: "max_hrs",
        header: "Period",
        enableSorting: false,
        enablePinning: false,
        enableHiding: false,
      },
    ]

    return [...mainCols, ...tonnageRangesCols, ...periodCols]
  }, [])

  const { table, ...dataGridProps } = useDataGrid({
    columns,
    data: pricings.routes,
    getRowId: (row) => row.route_id.toString(),
    readOnly: true,
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
  }, [dataGridProps.columnSizeVars])

  return (
    <div className="space-y-4">
      <div>Route Pricings</div>
      <DataGrid
        table={table}
        {...dataGridProps}
        columnSizeVars={patchedColumnSizeVars}
        height={520}
        stretchColumns={false}
      />
    </div>
  )
}
