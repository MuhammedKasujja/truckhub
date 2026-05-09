"use client";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatPrice } from "@/lib/format";
import { RideRequest, RideStatusList } from "@/features/ride-requests/types";
import { ColumnDef } from "@tanstack/react-table";
import { Status } from "@/components/ui/status";
import Link from "next/link";
import { HasPermission } from "@/components/has-permission";
import { EditIcon, EyeIcon } from "lucide-react";

export function getRideRequestTableColumns(): ColumnDef<RideRequest>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        return (
          <Button variant={"link"} asChild>
            <Link href={`/rides/${row.original.id}/view`}>
              {row.original.number}
            </Link>
          </Button>
        );
      },
      size: 100,
    },
    {
      accessorKey: "origin",
      header: "Origin",
      cell: ({ row }) => {
        return <p className="max-w-92 truncate">{row.original.origin}</p>;
      },
    },
    {
      accessorKey: "destination",
      header: "Destination",
      cell: ({ row }) => {
        return <p className="max-w-92 truncate">{row.original.destination}</p>;
      },
      size: 120,
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => {
        return (
          <Button variant={"link"} asChild>
            <Link href={`/customers/${row.original.customer.id}/view`}>
              {row.original.customer.fullname}
            </Link>
          </Button>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <Status>{row.original.status}</Status>;
      },
      meta: {
        label: "Status",
        variant: "multiSelect",
        options: RideStatusList.map((status) => ({
          label: `${status}`,
          value: `${status}`,
        })),
      },
      enableColumnFilter: true,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        return <div>{formatPrice(row.original.amount)}</div>;
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        return <p>{formatDateTime(row.original.request_start_time)}</p>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const ride = row.original;
        return (
          <div className="flex gap-2">
            {ride.status !== "completed" && (
              <HasPermission permission={"rides:view"}>
                <Button variant={"outline"} size={"icon"} asChild>
                  <Link href={`/rides/${ride.id}/view`}>
                    <EyeIcon />
                  </Link>
                </Button>
              </HasPermission>
            )}
            <HasPermission permission={"rides:edit"}>
              <Button variant={"outline"} size={"icon"} asChild>
                <Link href={`/rides/${ride.id}/edit`}>
                  <EditIcon />
                </Link>
              </Button>
            </HasPermission>
          </div>
        );
      },
      size: 120,
    },
  ];
}
