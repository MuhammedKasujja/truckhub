import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useQuery } from "@tanstack/react-query"
import { createAuditLogsDetailsQueryOptions } from "../query-options"
import { AuditLog } from "../types"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"

type AuditLogViewDialogProps = {
  audit?: AuditLog
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditLogViewDialog({
  audit,
  open,
  onOpenChange,
}: AuditLogViewDialogProps) {
  const { isLoading, data } = useQuery({
    ...createAuditLogsDetailsQueryOptions(audit?.id ?? ""),
    enabled: !!audit?.id,
  })
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md md:min-w-xl">
        <DialogHeader>
          <DialogTitle>Audit Details</DialogTitle>
        </DialogHeader>
        <div className="-mx-4 max-h-[90vh] overflow-y-auto px-4 space-y-4">
          {isLoading && <SkeletonAuditLogDetails />}
          {data?.data && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <Item>
                <ItemContent>
                  <ItemDescription>Actor</ItemDescription>
                  <ItemTitle>{data?.data.actor_name}</ItemTitle>
                </ItemContent>
              </Item>
              <Item>
                <ItemContent>
                  <ItemDescription>Type</ItemDescription>
                  <ItemTitle>{data?.data.resource_type}</ItemTitle>
                </ItemContent>
              </Item>
              <Item>
                <ItemContent>
                  <ItemDescription>Source</ItemDescription>
                  <ItemTitle>{data?.data.source}</ItemTitle>
                </ItemContent>
              </Item>
              <Item>
                <ItemContent>
                  <ItemDescription>Action</ItemDescription>
                  <ItemTitle>{data?.data.action}</ItemTitle>
                </ItemContent>
              </Item>
            </div>
          )}
          <Separator />
          <div className="text-muted-foreground">After</div>

          <table>
            <tbody className="space-y-2">
              {data?.data?.after &&
                Object.entries(data.data.after).map(([key, value]) => (
                  <tr key={key} className="mb-2">
                    <td className="font-light text-muted-foreground">
                      <strong>{key}</strong>
                    </td>
                    <td>
                      {typeof value === "object" && value !== null
                        ? JSON.stringify(value)
                        : value
                          ? String(value)
                          : "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <Separator />
          <div className="text-muted-foreground">Before</div>
          <table>
            <tbody className="space-y-2">
              {data?.data?.before &&
                Object.entries(data.data.before).map(([key, value]) => (
                  <tr key={key} className="mb-2">
                    <td className="font-light text-muted-foreground">
                      <strong>{key}</strong>
                    </td>
                    <td>
                      {typeof value === "object" && value !== null
                        ? JSON.stringify(value)
                        : value
                          ? String(value)
                          : "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SkeletonAuditLogDetails() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-6 flex-1" />
      <Skeleton className="h-6 flex-1" />
      <Skeleton className="h-6 flex-1" />
      <Skeleton className="h-6 flex-1" />
    </div>
  )
}
