import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type AuditLogViewDialogProps = {
  data: Record<string, unknown>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogViewDialog({
  data,
  open,
  onOpenChange,
}: AuditLogViewDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Audit Details</DialogTitle>
        </DialogHeader>
        <table>
          <tbody>
            {Object.entries(data).map(([key, value]) => (
              <tr key={key}>
                <td>
                  <strong>{key}</strong>
                </td>
                <td>
                  {typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DialogContent>
    </Dialog>
  )
}
