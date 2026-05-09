"use client";

import { DataTable } from "@/components/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getCustomers } from "@/features/clients/service";
import React from "react";
import { getCustomerTableColumns } from "./customer-table-columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { useFetchEror } from "@/hooks/use-fetch-error";
import { HasPermission } from "@/components/has-permission";

type CustomerTableProps = {
  promises: Promise<[Awaited<ReturnType<typeof getCustomers>>]>;
};

export function CustomerTable(props: CustomerTableProps) {
  const [{ data, error, pagination }] = React.use(props.promises);
  const columns = React.useMemo(() => getCustomerTableColumns(), []);

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

export function CustomerTableSkeleton() {
  return (
    <DataTableSkeleton
      columnCount={getCustomerTableColumns().length}
      filterCount={1}
      shrinkZero
    />
  );
}
