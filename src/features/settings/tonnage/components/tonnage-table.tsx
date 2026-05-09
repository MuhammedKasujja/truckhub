"use client";

import React from "react";
import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { useDataTable } from "@/hooks/use-data-table";
import { getTonnages } from "@/features/settings/tonnage/service";
import { getTonnageColumns } from "./tonnage-table-columns";
import { useFetchEror } from "@/hooks/use-fetch-error";

type TonnageTableProps = {
  tonnageListPromise: Promise<Awaited<ReturnType<typeof getTonnages>>>;
};

export function TonnageTable(props: TonnageTableProps) {
  const { data, error } = React.use(props.tonnageListPromise);
  const columns = React.useMemo(() => getTonnageColumns(), []);

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

  return <DataTable table={table} showPagination={false} />;
}

export function TonnageTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getTonnageColumns().length}
      filterCount={1}
      shrinkZero
    />
  );
}
