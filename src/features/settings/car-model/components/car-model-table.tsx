"use client";

import React from "react";
import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getCarModelColumns } from "./car-model-table-columns";
import { getCarModels } from "@/features/settings/car-model/service";
import { CarModelForm } from "./car-brand-form";
import { getVehicleSettings } from "@/server/settings";
import { useFetchEror } from "@/hooks/use-fetch-error";

type CarModelTableProps = {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getCarModels>>,
      Awaited<ReturnType<typeof getVehicleSettings>>,
    ]
  >;
};

export function CarModelTable(props: CarModelTableProps) {
  const [{ data: carModels, error }, { data: vehicleConfigurations }] =
    React.use(props.promises);

  useFetchEror(error);

  const columns = React.useMemo(() => getCarModelColumns(), []);

  const { table } = useDataTable({
    data: carModels,
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
        <CarModelForm vehicleConfigurations={vehicleConfigurations} />
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  );
}

export function CarModelTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getCarModelColumns().length}
      filterCount={1}
      shrinkZero
    />
  );
}
