import { createFileRoute } from "@tanstack/react-router"
import { hasPermission } from "@/lib/auth"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import {
  AuditLogTable,
  AuditLogTableSkeleton,
} from "@/features/audit_logs/components/audit-log-table"
import { PageBackButton } from "@/components/page-header"
import { createAuditLogsQueryOptions } from "@/features/audit_logs/query-options"

export const Route = createFileRoute("/_admin/reports/audits/")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("config:view:audit_logs"),
  pendingComponent: AuditLogTableSkeleton,
  loader: ({ context, location }) => {
    context.queryClient.prefetchQuery(
      createAuditLogsQueryOptions(location.search)
    )
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
