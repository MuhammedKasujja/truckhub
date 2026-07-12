import { ActionButton } from "@/components/ui/action-button"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format"
import { deleteClientFn } from "@/features/clients/services"
import { Client } from "@/features/clients/types"
import { ColumnDef } from "@tanstack/react-table"
import { Trash2Icon } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import { Can } from "@/components/has-permission"
import { ClientTableActions } from "./client-table-actions"
import { TFunction } from "@/i18n"

export function getClientsTableColumns(tr: TFunction): ColumnDef<Client>[] {
  return [
    {
      id: "left-actions",
      size: 20,
      maxSize: 16,
      cell: ({ row }) => <ClientTableActions client={row.original} />,
    },
    {
      accessorKey: "name",
      header: tr("common.form.name"),
      cell: ({ row }) => {
        return (
          <Button variant={"link"} asChild>
            <Link
              to={"/clients/$clientId/view"}
              params={{ clientId: row.original.id }}
            >
              {row.original.name}
            </Link>
          </Button>
        )
      },
    },
    {
      accessorKey: "email",
      header: tr("common.form.email"),
      cell: ({ row }) => {
        return <p>{row.original.email}</p>
      },
    },
    {
      accessorKey: "phone",
      header: tr("common.form.phone"),
      cell: ({ row }) => {
        return <p>{row.original.phone}</p>
      },
    },
    {
      accessorKey: "created_at",
      header: tr("common.form.date"),
      cell: ({ row }) => {
        return <p>{formatDateTime(row.original.created_at)}</p>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Can permission={"clients:delete"}>
              <ActionButton
                variant={"destructive"}
                size={"icon"}
                requireAreYouSure
                action={async () => {
                  const { isSuccess, error, message } = await deleteClientFn({
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
