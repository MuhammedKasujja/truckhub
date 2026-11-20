import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/auth"
import {
  PageBackButton,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import {
  AuditLogTable,
  AuditLogTableSkeleton,
} from "@/features/audit_logs/components/audit-log-table"
import { createAuditLogsQueryOptions } from "@/features/audit_logs/query-options"
import { AuditLogSearchParamsCache } from "@/features/audit_logs/schemas"

export const Route = createFileRoute("/_admin/reports/audits/")({
  validateSearch: AuditLogSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  component: RouteComponent,
  beforeLoad: () => requirePermission("reports:audit_logs:view"),
  pendingComponent: AuditLogTableSkeleton,
  loader: ({ context, deps: { search } }) => {
    context.queryClient.prefetchQuery(createAuditLogsQueryOptions(search))
  },
})

function RouteComponent() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader className="pb-0">
        <div className="flex items-start gap-1">
          <PageBackButton />
          <div>
            <PageTitle>Audit logs</PageTitle>
            <PageDescription>
              Every create, edit, delete and approval across the system. Open an
              entry to see exactly which fields changed.
            </PageDescription>
          </div>
        </div>
      </PageHeader>
      <AuditLogTable />
    </div>
  )
}
