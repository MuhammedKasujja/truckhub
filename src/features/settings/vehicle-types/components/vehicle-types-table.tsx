"use client";

import React from "react";
import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getVehicleTypeColumns } from "./vehicle-table-columns";
import { getVehicleTypes } from "@/features/settings/vehicle-types/service";
import { VehicleTypeForm } from "./vehicle-type-form";
import { useFetchEror } from "@/hooks/use-fetch-error";

type VehicleTypeTableProps = {
  promise: Promise<Awaited<ReturnType<typeof getVehicleTypes>>>;
};

export function VehicleTypeTable(props: VehicleTypeTableProps) {
  const { data, error } = React.use(props.promise);
  const columns = React.useMemo(() => getVehicleTypeColumns(), []);

  useFetchEror(error);

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
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table}>
        <VehicleTypeForm />
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  );
}

export function VehicleTypeTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getVehicleTypeColumns().length}
      filterCount={1}
      shrinkZero
    />
  );
}
