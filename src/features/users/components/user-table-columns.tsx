import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { deleteUserById } from "@/features/users/service";
import { SystemUser } from "@/features/users/types";
import { ColumnDef } from "@tanstack/react-table";
import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { HasPermission } from "@/components/has-permission";

export function getUserTableColumns(): ColumnDef<SystemUser>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return (
          <Button variant={"link"} asChild>
            <Link href={`/users/${row.original.id}/view`}>
              {row.original.name}
            </Link>
          </Button>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <p>{row.original.email}</p>;
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        return <p>{row.original.phone}</p>;
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
            <HasPermission permission={"users:view"}>
              <Button variant={"outline"} size={"icon"} asChild>
                <Link href={`/users/${row.original.id}/view`}>
                  <EyeIcon />
                </Link>
              </Button>
            </HasPermission>
            <HasPermission permission={"users:edit"}>
              <Button variant={"outline"} size={"icon"} asChild>
                <Link href={`/users/${row.original.id}/edit`}>
                  <EditIcon />
                </Link>
              </Button>
            </HasPermission>
            <HasPermission permission={"users:delete"}>
              <ActionButton
                variant={"destructive"}
                size={"icon"}
                requireAreYouSure
                action={async () => {
                  const { isSuccess, error, message } = await deleteUserById(
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
            </HasPermission>
          </div>
        );
      },
    },
  ];
}
