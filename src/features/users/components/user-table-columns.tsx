import { ActionButton } from "@/components/ui/action-button"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format"
import { deleteUserFn } from "@/features/users/services"
import { SystemUser } from "@/features/users/types"
import { ColumnDef } from "@tanstack/react-table"
import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import { Can } from "@/components/has-permission"

export function getUserTableColumns(): ColumnDef<SystemUser>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        return (
          <Button variant={"link"} asChild>
            <Link
              to={`/settings/user-management/users/$userId/view`}
              params={{ userId: row.original.id }}
            >
              {row.original.name}
            </Link>
          </Button>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <p>{row.original.email}</p>
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        return <p>{row.original.phone}</p>
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        return <p>{formatDateTime(row.original.created_at)}</p>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Can permission={"users:view"}>
              <Button variant={"outline"} size={"icon"} asChild>
                <Link
                  to={`/settings/user-management/users/$userId/view`}
                  params={{ userId: row.original.id }}
                >
                  <EyeIcon />
                </Link>
              </Button>
            </Can>
            <Can permission={"users:edit"}>
              <Button variant={"outline"} size={"icon"} asChild>
                <Link
                  to={`/settings/user-management/users/$userId/edit`}
                  params={{ userId: row.original.id }}
                >
                  <EditIcon />
                </Link>
              </Button>
            </Can>
            <Can permission={"users:delete"}>
              <ActionButton
                variant={"destructive"}
                size={"icon"}
                requireAreYouSure
                action={async () => {
                  const { isSuccess, error, message } = await deleteUserFn({
                    data: { id: row.original.id },
                  })
                  if (isSuccess) {
                    toast.success(message)
                    return { error: false }
                  } else {
                    return { error: true, message: error?.message }
                  }
                }}
              >
                <Trash2Icon />
              </ActionButton>
            </Can>
          </div>
        )
      },
    },
  ]
}
