"use client";

import React from "react";
import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getDriveTrainColumns } from "./drive-train-table-columns";
import { getDriveTrains } from "@/features/settings/drive-trains/service";
import { DriveTrainForm } from "./drive-train-form";
import { useFetchEror } from "@/hooks/use-fetch-error";

type DriveTrainTableProps = {
  promise: Promise<Awaited<ReturnType<typeof getDriveTrains>>>;
};

export function DriveTrainTable(props: DriveTrainTableProps) {
  const { data, error } = React.use(props.promise);
  const columns = React.useMemo(() => getDriveTrainColumns(), []);

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
        <DriveTrainForm />
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  );
}

export function DriveTrainTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getDriveTrainColumns().length}
      filterCount={1}
      shrinkZero
    />
  );
}
