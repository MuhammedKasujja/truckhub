import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, EyeIcon } from "lucide-react";
import { RoleEditForm } from "./role-edit-form";
import { Role } from "../types";

export function getRoleColumns(): ColumnDef<Role>[] {
  return [
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
        const Role = row.original;
        return (
          <div className="flex gap-2">
            <Button variant={"outline"} size={"icon"}>
              <EyeIcon />
            </Button>
            <RoleEditForm
              initialData={{ ...Role }}
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
