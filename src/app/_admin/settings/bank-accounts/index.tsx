import { ModuleIcon } from "@/components/icons"
import { PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { IconCloud } from "@tabler/icons-react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/bank-accounts/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="space-y-5">
      <PageHeader>
        <PageTitle>Bank Accounts</PageTitle>
      </PageHeader>
      <Empty className="h-100 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconCloud />
          </EmptyMedia>
          <EmptyTitle>No Active Bank Account</EmptyTitle>
          <EmptyDescription>
            Set default active bank account for payments.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" size="sm">
            <ModuleIcon module="Settings" />
            Configure Account
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
