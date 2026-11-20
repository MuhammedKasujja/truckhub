import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { StaffForm } from "@/features/hr/components/staff-form"
import { staffQueryOptions } from "@/features/hr/query-options"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr/staff/$staffId/edit")({
  beforeLoad: () => requirePermission("hr:staff:edit"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(staffQueryOptions(params.staffId)),
  component: RouteComponent,
})

function RouteComponent() {
  const { staffId } = Route.useParams()
  const { data: staff } = useSuspenseQuery(staffQueryOptions(staffId))
  return <StaffForm staff={staff} />
}
