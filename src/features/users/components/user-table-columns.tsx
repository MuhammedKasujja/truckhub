import { ActionButton } from "@/components/ui/action-button"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format"
import { deleteUserFn } from "@/features/users/services"
import { SystemUser } from "@/features/users/types"
import { ColumnDef } from "@tanstack/react-table"
import {
  EditIcon,
  EyeIcon,
  MoreVertical,
  SettingsIcon,
  Trash2Icon,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import { Can } from "@/components/has-permission"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableRowAction } from "@/types/data-table"

interface GetUserTableColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<SystemUser> | null>
  >
}

export function getUserTableColumns({
  setRowAction,
}: GetUserTableColumnsProps): ColumnDef<SystemUser>[] {
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size={"sm"}>
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <Can permission={"users:view"}>
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/settings/user-management/users/$userId/view`}
                      params={{ userId: row.original.id }}
                    >
                      <EyeIcon />
                      View
                    </Link>
                  </DropdownMenuItem>
                </Can>
                <Can permission={"users:edit"}>
                  <DropdownMenuItem asChild>
                    <Link
                      to={`/settings/user-management/users/$userId/edit`}
                      params={{ userId: row.original.id }}
                    >
                      <EditIcon />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                </Can>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setRowAction({ row, variant: "update" })}
                >
                  <SettingsIcon />
                  Assign Roles
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Can permission={"users:delete"}>
                  <DropdownMenuItem variant="destructive">
                    {/* <ActionButton
                      variant={"destructive"}
                      size={"icon"}
                      requireAreYouSure
                      action={async () => {
                        const { isSuccess, error, message } =
                          await deleteUserFn({
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
                      <div className="flex gap-4"> */}
                    {/* <Button type="button" variant={"destructive"}> */}
                    <Trash2Icon />
                    Delete
                    {/* </Button> */}
                    {/* </div>
                    </ActionButton> */}
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
