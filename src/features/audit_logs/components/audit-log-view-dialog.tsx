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
    enabled: audit?.id != undefined,
  })
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md md:min-w-xl">
        <DialogHeader>
          <DialogTitle>Audit Details</DialogTitle>
        </DialogHeader>
        {isLoading && <SkeletonAuditLogDetails />}
        {data?.data && (
          <div>
            <Item>
              <ItemContent>
                <ItemTitle>{data?.data.actor_name}</ItemTitle>
                <ItemDescription>Actor</ItemDescription>
              </ItemContent>
            </Item>
            <Item>
              <ItemContent>
                <ItemTitle>{data?.data.resource_type}</ItemTitle>
                <ItemDescription>Type</ItemDescription>
              </ItemContent>
            </Item>
            <Item>
              <ItemContent>
                <ItemTitle>{data?.data.source}</ItemTitle>
                <ItemDescription>Source</ItemDescription>
              </ItemContent>
            </Item>
            <Item>
              <ItemContent>
                <ItemTitle>{data?.data.action}</ItemTitle>
                <ItemDescription>Action</ItemDescription>
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
        <Separator />
        <div className="text-muted-foreground">Before</div>
        <table>
          <tbody className="space-y-2">
            {data?.data?.before &&
              Object.entries(data.data.before).map(([key, value]) => (
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
