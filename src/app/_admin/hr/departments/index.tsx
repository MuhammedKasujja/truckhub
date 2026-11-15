import { createFileRoute } from "@tanstack/react-router"
import { DepartmentList } from "@/features/hr/components/department-list"
import { departmentsQueryOptions } from "@/features/hr/query-options"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr/departments/")({
  beforeLoad: () => requirePermission("hr:staff:view"),
  component: DepartmentList,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(departmentsQueryOptions())
  },
})
