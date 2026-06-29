import { ActionButton } from "@/components/ui/action-button"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format"
import { deleteDriverFn } from "@/features/drivers/services"
import { Driver } from "@/features/drivers/types"
import { ColumnDef } from "@tanstack/react-table"
import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import { Can } from "@/components/has-permission"
import { TFunction } from "@/i18n"

export function getDriverTableColumns(tr: TFunction): ColumnDef<Driver>[] {
  return [
    {
      accessorKey: "name",
      header: tr('form.name'),
      cell: ({ row }) => {
        return (
          <Button variant={"link"} asChild>
            <Link
              to={`/drivers/$driverId/view`}
              params={{ driverId: row.original.id }}
            >
              {row.original.fullname}
            </Link>
          </Button>
        )
      },
    },
    {
      accessorKey: "email",
      header: tr('form.name'),
      cell: ({ row }) => {
        return <p>{row.original.email}</p>
      },
    },
    {
      accessorKey: "phone",
      header: tr('form.phone'),
      cell: ({ row }) => {
        return <p>{row.original.phone}</p>
      },
    },
    {
      accessorKey: "created_at",
      header: tr('form.date'),
      cell: ({ row }) => {
        return <p>{formatDateTime(row.original.created_at)}</p>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Can permission={"drivers:view"}>
              <Button variant={"outline"} size={"icon"}>
                <Link
                  to={`/drivers/$driverId/view`}
                  params={{ driverId: row.original.id }}
                >
                  <EyeIcon />
                </Link>
              </Button>
            </Can>
            <Can permission={"drivers:edit"}>
              <Button variant={"outline"} size={"icon"} asChild>
                <Link
                  to={`/drivers/$driverId/edit`}
                  params={{ driverId: row.original.id }}
                >
                  <EditIcon />
                </Link>
              </Button>
            </Can>
            <Can permission={"drivers:delete"}>
              <ActionButton
                variant={"destructive"}
                size={"icon"}
                requireAreYouSure
                action={async () => {
                  const { isSuccess, error, message } = await deleteDriverFn({
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
