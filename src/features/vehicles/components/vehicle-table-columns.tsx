import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { deleteVehicleById } from "@/features/vehicles/service";
import { Vehicle } from "@/features/vehicles/types";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Can } from "@/components/has-permission";

export function getVehicleTableColumns(): ColumnDef<Vehicle>[] {
  return [
    {
      accessorKey: "number",
      header: "ID",
      cell: ({ row }) => {
        return (
          <Can permission={"vehicles:view"}>
            <Button variant={"link"} asChild>
              <Link href={`/vehicles/${row.original.id}/view`}>
                {row.original.number}
              </Link>
            </Button>
          </Can>
        );
      },
    },
    {
      accessorKey: "plate_number",
      header: "License",
      cell: ({ row }) => {
        return <>{row.original.plate_number}</>;
      },
    },
    {
      id: "engine_type",
      header: "Engine",
      cell: ({ row }) => {
        return (
          <p>
            {row.original.engine_type}/ {row.original.gearbox}
          </p>
        );
      },
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => {
        return (
          <p>
            {row.original.color}/ {row.original.interior_color}
          </p>
        );
      },
    },
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ row }) => {
        return <p>{row.original.year}</p>;
      },
    },
    {
      id: "driver",
      header: "Driver",
      cell: ({ row }) => {
        const driver = row.original.driver;
        return driver == null ? (
          <p>-</p>
        ) : (
          <Can permission="drivers:view">
            <Button variant={"link"} asChild>
              <Link href={`/drivers/${row.original.id}/view`}>
                {driver.name}
              </Link>
            </Button>
          </Can>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        return <p>{formatDateTime(row.original.created_at)}</p>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Can permission={"vehicles:view"}>
              <Button variant={"outline"} size={"icon"}>
                <Link href={`/vehicles/${row.original.id}/view`}>
                  <EyeIcon />
                </Link>
              </Button>
            </Can>
            <Can permission={"vehicles:edit"}>
              <Button variant={"outline"} size={"icon"} asChild>
                <Link href={`/vehicles/${row.original.id}/edit`}>
                  <EditIcon />
                </Link>
              </Button>
            </Can>
            <Can permission={"vehicles:delete"}>
              <ActionButton
                variant={"destructive"}
                size={"icon"}
                requireAreYouSure
                action={async () => {
                  const { isSuccess, error, message } = await deleteVehicleById(
                    row.original.id,
                  );
                  if (isSuccess) {
                    toast.success(message);
                    return { error: false };
                  } else {
                    return { error: true, message: error?.message };
                  }
                }}
              >
                <Trash2Icon />
              </ActionButton>
            </Can>
          </div>
        );
      },
    },
  ];
}
