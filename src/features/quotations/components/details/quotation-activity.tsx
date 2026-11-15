import { useQuery } from "@tanstack/react-query"
import {
  QUOTATION_ACTIVITY_META,
  describeQuotationActivity,
} from "../../format"
import { quotationActivitiesQueryOptions } from "../../query-options"
import type { EntityId } from "@/schemas"
import { ActivityTimeline } from "@/components/activity-timeline"
import { usePermissions } from "@/features/auth/hooks/use-permissions"

/** The quotation's timeline: created, revised, sent, accepted, ... */
export function QuotationActivity({ quotationId }: { quotationId: EntityId }) {
  const { hasPermission } = usePermissions()
  const allowed = hasPermission("quotations:activities")

  const { data, isLoading } = useQuery({
    ...quotationActivitiesQueryOptions(quotationId),
    enabled: allowed,
  })

  if (!allowed) return null

  return (
    <div>
      <p className="mb-3 text-xs font-medium text-muted-foreground">Activity</p>
      <ActivityTimeline
        activities={data}
        meta={QUOTATION_ACTIVITY_META}
        describe={describeQuotationActivity}
        isLoading={isLoading}
      />
    </div>
  )
}
