import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { StaffDetails } from "@/features/hr/components/staff-details"
import { staffQueryOptions } from "@/features/hr/query-options"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr/staff/$staffId/view")({
  beforeLoad: () => requirePermission("hr:staff:view"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(staffQueryOptions(params.staffId)),
  component: RouteComponent,
})

function RouteComponent() {
  const { staffId } = Route.useParams()
  const { data: staff } = useSuspenseQuery(staffQueryOptions(staffId))
  return <StaffDetails staff={staff} />
}
