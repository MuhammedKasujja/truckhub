import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/format"
import { Client, ClientsTableRowAction } from "@/features/clients/types"
import { ColumnDef } from "@tanstack/react-table"
import { Link } from "@tanstack/react-router"
import { ClientTableActions } from "./client-table-actions"
import { TFunction } from "@/i18n"

type Props = {
  tr: TFunction
  setRowAction: React.Dispatch<
    React.SetStateAction<ClientsTableRowAction | null>
  >
}

export function getClientsTableColumns({
  tr,
  setRowAction,
}: Props): ColumnDef<Client>[] {
  return [
    {
      accessorKey: "name",
      header: tr("common.client"),
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
      id: "left-actions",
      size: 20,
      maxSize: 16,
      cell: ({ row }) => (
        <ClientTableActions row={{ row }} setRowAction={setRowAction} />
      ),
    },
  ]
}
