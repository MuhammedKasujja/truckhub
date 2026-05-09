"use client";

import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getDrivers } from "@/features/drivers/service";
import React, { useMemo } from "react";
import { getDriverTableColumns } from "./driver-table-columns";
import { useFetchEror } from "@/hooks/use-fetch-error";

type DriverTableProps = {
  promises: Promise<[Awaited<ReturnType<typeof getDrivers>>]>;
};

export function DriverTable(props: DriverTableProps) {
  const [{ data, error, pagination }] = React.use(props.promises);
  const columns = useMemo(() => getDriverTableColumns(), []);

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
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  );
}

export function DriverTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getDriverTableColumns().length}
      filterCount={1}
      shrinkZero
    />
  );
}
