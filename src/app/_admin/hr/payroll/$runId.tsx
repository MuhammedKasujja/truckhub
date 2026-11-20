import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { PayrollRunDetails } from "@/features/hr/components/payroll-run-details"
import { payrollRunQueryOptions } from "@/features/hr/query-options"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr/payroll/$runId")({
  beforeLoad: () => requirePermission("hr:payroll:view"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(payrollRunQueryOptions(params.runId)),
  component: RouteComponent,
})

function RouteComponent() {
  const { runId } = Route.useParams()
  const { data: run } = useSuspenseQuery(payrollRunQueryOptions(runId))
  return <PayrollRunDetails run={run} />
}
