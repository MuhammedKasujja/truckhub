import { useQuery } from "@tanstack/react-query"
import { INVOICE_ACTIVITY_META, describeInvoiceActivity } from "../format"
import { invoiceActivitiesQueryOptions } from "../query-options"
import type { EntityId } from "@/schemas"
import { ActivityTimeline } from "@/components/activity-timeline"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

/** The invoice's timeline: created, sent, payments, voided. */
export function InvoiceActivityCard({ invoiceId }: { invoiceId: EntityId }) {
  const { hasPermission } = usePermissions()
  const allowed = hasPermission("invoices:activities")

  const { data, isLoading } = useQuery({
    ...invoiceActivitiesQueryOptions(invoiceId),
    enabled: allowed,
  })

  if (!allowed) return null

  return (
    <Card>
      <CardHeader>
        <CardDescription>Activity</CardDescription>
      </CardHeader>
      <CardContent>
        <ActivityTimeline
          activities={data}
          meta={INVOICE_ACTIVITY_META}
          describe={describeInvoiceActivity}
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  )
}
