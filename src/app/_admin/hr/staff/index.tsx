import { createFileRoute } from "@tanstack/react-router"
import { StaffList } from "@/features/hr/components/staff-list"
import {
  departmentsQueryOptions,
  staffListQueryOptions,
} from "@/features/hr/query-options"
import { StaffSearchSchema } from "@/features/hr/schemas"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr/staff/")({
  validateSearch: StaffSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  beforeLoad: () => requirePermission("hr:staff:view"),
  component: StaffList,
  loader: ({ context, deps: { search } }) => {
    context.queryClient.prefetchQuery(staffListQueryOptions(search))
    context.queryClient.prefetchQuery(departmentsQueryOptions())
  },
})
