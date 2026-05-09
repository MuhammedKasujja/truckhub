import type { ColumnDef } from "@tanstack/react-table";
import type { AuditLog } from "@/features/audit_logs/types";
import { TFunction } from "@/i18n";
import { formatDate } from "@/lib/format";
import { ActionButton } from "@/components/ui/action-button";
import { Trash2Icon } from "lucide-react";

export function getAuditLogTableColumns(tr: TFunction): ColumnDef<AuditLog>[] {
  return [
    {
      accessorKey: "resource_type",
      header: "Model",
      cell: ({ row }) => {
        return <div className="flex gap-2">{row.original.resource_type}</div>;
      },
      meta: {
        label: "Model",
      },
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div className="flex gap-2">{row.original.action}</div>;
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => {
        return <div className="flex gap-2">{row.original.source}</div>;
      },
    },
    {
      accessorKey: "created_at",
      header: tr("payments.date"),
      cell: ({ row }) => {
        return <p>{formatDate(row.original.created_at)}</p>;
      },
      meta: {
        label: tr("payments.date"),
        variant: "dateRange",
      },
      enableColumnFilter: true,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <ActionButton
              variant={"destructive"}
              size={"icon"}
              requireAreYouSure
              action={async () => {
                return { error: true, message: "Not implemented yet...." };
              }}
            >
              <Trash2Icon />
            </ActionButton>
          </div>
        );
      },
      size: 100,
    },
  ];
}
