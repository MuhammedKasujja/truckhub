"use client";

import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getBookings } from "@/features/bookings/services";
import React from "react";
import { getBookingTableColumns } from "./booking-table-columns";
import { useFetchEror } from "@/hooks/use-fetch-error";

type TripTableProps = {
  promises: Promise<[Awaited<ReturnType<typeof getBookings>>]>;
};

export function BookingTable(props: TripTableProps) {
  const [{ data, error, pagination }] = React.use(props.promises);

  const columns = React.useMemo(() => getBookingTableColumns(), []);

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

export function BookingTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getBookingTableColumns().length}
      filterCount={1}
      shrinkZero
    />
  );
}
