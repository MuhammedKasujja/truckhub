import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DriveTrain } from "@/features/settings/drive-trains/types";
import { ColumnDef } from "@tanstack/react-table";
import { CarIcon } from "lucide-react";
import { DriveTrainForm } from "./drive-train-form";
import { ActionIcon } from "@/components/icons";

export function getDriveTrainColumns(): ColumnDef<DriveTrain>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => {
        return <p>{row.original.id}</p>;
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return <p>{row.original.name}</p>;
      },
    },
    {
      accessorKey: "is_truck",
      header: "Truck",
      cell: ({ row }) => {
        return (
          <p>
            {row.original.is_truck && (
              <Badge variant={"secondary"}>
                <CarIcon />
              </Badge>
            )}
          </p>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button variant={"outline"} size={"icon"}>
              <ActionIcon action="view" />
            </Button>
            <DriveTrainForm
              initialData={{ ...row.original }}
              trigger={
                <Button variant={"outline"} size={"icon"}>
                  <ActionIcon action="edit" />
                </Button>
              }
            />
          </div>
        );
      },
    },
  ];
}
