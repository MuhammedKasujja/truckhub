import { createFileRoute } from "@tanstack/react-router"
import { LeaveRequests } from "@/features/hr/components/leave-requests"
import { leaveRequestsQueryOptions } from "@/features/hr/query-options"
import { LeaveRequestSearchSchema } from "@/features/hr/schemas"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr/leave/")({
  validateSearch: LeaveRequestSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  beforeLoad: () => requirePermission("hr:leave:view"),
  component: LeaveRequests,
  loader: ({ context, deps: { search } }) => {
    context.queryClient.prefetchQuery(leaveRequestsQueryOptions(search))
  },
})
