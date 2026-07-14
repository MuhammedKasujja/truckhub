import { AuditLogTableRowAction } from "../types"
import { AuditLogViewDialog } from "./audit-log-view-dialog"

interface AuditLogTableActionsProps {
  rowAction: AuditLogTableRowAction | null
  setRowAction: React.Dispatch<
    React.SetStateAction<AuditLogTableRowAction | null>
  >
}

export function AuditLogTableActions({
  rowAction,
  setRowAction,
}: AuditLogTableActionsProps) {
  const handleClose = () => setRowAction(null)

  return (
    <AuditLogViewDialog
      data={rowAction?.row.original ?? {}}
      open={rowAction?.variant === "view"}
      onOpenChange={handleClose}
    />
  )
}
