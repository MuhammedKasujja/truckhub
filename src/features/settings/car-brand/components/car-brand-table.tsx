"use client";

import React from "react";
import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getCarBrandColumns } from "./car-brand-table-columns";
import { getCarBrands } from "@/features/settings/car-brand/service";
import { CarBrandForm } from "./car-brand-form";
import { useFetchEror } from "@/hooks/use-fetch-error";

type CarBrandTableProps = {
  carBrandListPromise: Promise<Awaited<ReturnType<typeof getCarBrands>>>;
};

export function CarBrandTable(props: CarBrandTableProps) {
  const { data, error } = React.use(props.carBrandListPromise);
  const columns = React.useMemo(() => getCarBrandColumns(), []);
  
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
        <CarBrandForm />
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  );
}

export function CarBrandTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getCarBrandColumns().length}
      filterCount={1}
      shrinkZero
    />
  );
}
