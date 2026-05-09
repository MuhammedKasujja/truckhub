"use client";

import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getRideRequests } from "@/features/ride-requests/service";
import React from "react";
import { getRideRequestTableColumns } from "./ride-request-table-columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapIcon } from "lucide-react";
import { useFetchEror } from "@/hooks/use-fetch-error";

type TripTableProps = {
  promises: Promise<[Awaited<ReturnType<typeof getRideRequests>>]>;
};

export function RideRequestTable(props: TripTableProps) {
  const [{ data, error, pagination }] = React.use(props.promises);

  const columns = React.useMemo(() => getRideRequestTableColumns(), []);

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
        <Button size={"sm"} asChild>
            <Link href={"/rides/live"}>
              <MapIcon />
              Live
            </Link>
          </Button>
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar>
    </DataTable>
  );
}

export function RideRequestTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getRideRequestTableColumns().length}
      filterCount={1}
      shrinkZero
    />
  );
}
