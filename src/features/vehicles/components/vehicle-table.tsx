"use client";

import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getVehicles } from "@/features/vehicles/service";
import React from "react";
import { getVehicleTableColumns } from "./vehicle-table-columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { useFetchEror } from "@/hooks/use-fetch-error";
import { HasPermission } from "@/components/has-permission";

type VehicleTableProps = {
  promises: Promise<[Awaited<ReturnType<typeof getVehicles>>]>;
};

export function VehicleTable(props: VehicleTableProps) {
  const [{ data, error, pagination }] = React.use(props.promises);
  const columns = React.useMemo(() => getVehicleTableColumns(), []);

  useFetchEror(error);

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
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <HasPermission permission={"vehicles:create"}>
          <Button asChild>
            <Link href={"/vehicles/new"}>
              <PlusIcon />
              New Vehicle
            </Link>
          </Button>
        </HasPermission>
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  );
}

export function VehicleTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getVehicleTableColumns().length}
      filterCount={1}
      shrinkZero
    />
  );
}
