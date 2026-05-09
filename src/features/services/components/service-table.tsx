"use client";

import React from "react";
import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getServiceTableColumns } from "./service-table-columns";
import { ServiceGroup } from "@/features/services/types";

type ServiceTableProps = {
  services: ServiceGroup[];
};

export function ServiceTable({ services }: ServiceTableProps) {
  const columns = React.useMemo(() => getServiceTableColumns(), []);

  const { table } = useDataTable({
    data: services,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "category", desc: true }],
      //   columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow) => originalRow.category.toString(),
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <DataTable table={table} showPagination={false}>
      {/* <DataTableToolbar table={table}>
        <DataTableSortList table={table} align="end" />
      </DataTableToolbar> */}
    </DataTable>
  );
}

export function ServiceTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getServiceTableColumns().length}
      filterCount={1}
      shrinkZero
    />
  );
}
