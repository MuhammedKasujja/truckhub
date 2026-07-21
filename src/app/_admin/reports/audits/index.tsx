import { createFileRoute } from "@tanstack/react-router"
import { requirePermission } from "@/lib/auth"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import {
  AuditLogTable,
  AuditLogTableSkeleton,
} from "@/features/audit_logs/components/audit-log-table"
import { PageBackButton } from "@/components/page-header"
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
    <>
      <PageHeader>
        <PageTitle>
          <PageBackButton />
          Audit Logs
        </PageTitle>
        <PageAction>
          <PageBackButton />
        </PageAction>
      </PageHeader>
      <AuditLogTable />
    </>
  )
}
