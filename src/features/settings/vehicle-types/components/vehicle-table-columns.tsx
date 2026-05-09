import { Button } from "@/components/ui/button";
import { VehicleType } from "@/features/settings/vehicle-types/types";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, EyeIcon } from "lucide-react";
import { VehicleTypeForm } from "./vehicle-type-form";

export function getVehicleTypeColumns(): ColumnDef<VehicleType>[] {
  return [
    {
      accessorKey: "id",
      header: "Id",
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
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button variant={"outline"} size={"icon"}>
              <EyeIcon />
            </Button>
            <VehicleTypeForm
              initialData={{ ...row.original }}
              trigger={
                <Button variant={"outline"} size={"icon"}>
                  <EditIcon />
                </Button>
              }
            />
          </div>
        );
      },
    },
  ];
}
