import { Button } from "@/components/ui/button";
import { CarModel } from "@/features/settings/car-model/types";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, EyeIcon } from "lucide-react";
import { CarModelForm } from "./car-brand-form";

export function getCarModelColumns(): ColumnDef<CarModel>[] {
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
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button variant={"outline"} size={"icon"}>
              <EyeIcon />
            </Button>
            {/* <CarModelForm
              initialData={{ ...row.original }}
              trigger={ */}
            <Button variant={"outline"} size={"icon"}>
              <EditIcon />
            </Button>
            {/* }
            /> */}
          </div>
        );
      },
    },
  ];
}
