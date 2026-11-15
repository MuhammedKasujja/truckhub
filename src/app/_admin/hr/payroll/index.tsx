import { createFileRoute } from "@tanstack/react-router"
import { PayrollRuns } from "@/features/hr/components/payroll-runs"
import { payrollRunsQueryOptions } from "@/features/hr/query-options"
import { PayrollRunSearchSchema } from "@/features/hr/schemas"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr/payroll/")({
  validateSearch: PayrollRunSearchSchema,
  loaderDeps: ({ search }) => ({ search }),
  beforeLoad: () => requirePermission("hr:payroll:view"),
  component: PayrollRuns,
  loader: ({ context, deps: { search } }) => {
    context.queryClient.prefetchQuery(payrollRunsQueryOptions(search))
  },
})
