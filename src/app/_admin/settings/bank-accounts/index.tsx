import { ActionIcon, ModuleIcon } from "@/components/icons"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import {
  BankAccountForm,
  BankAccountList,
  BankDetailsForm,
} from "@/features/settings/bank-accounts/components"
import { bankAccountsListQueryOptions } from "@/features/settings/bank-accounts/query-options"
import { IconCloud } from "@tabler/icons-react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/bank-accounts/")({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(bankAccountsListQueryOptions()),
})

function RouteComponent() {
  const { data } = useSuspenseQuery(bankAccountsListQueryOptions())
  return (
    <div className="space-y-5">
      <PageHeader>
        <PageTitle>Bank Accounts</PageTitle>
        <PageAction className="space-x-2">
          <BankDetailsForm
            trigger={
              <Button variant="outline" size="sm">
                <ActionIcon action="create" />
                Bank
              </Button>
            }
          />
          <BankAccountForm
            trigger={
              <Button variant="outline" size="sm">
                <ActionIcon action="create" />
                Add Account
              </Button>
            }
          />
        </PageAction>
      </PageHeader>
      {data.length === 0 && (
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
            <BankAccountForm
              trigger={
                <Button variant="outline" size="sm">
                  <ModuleIcon module="Settings" />
                  Configure Account
                </Button>
              }
            />
          </EmptyContent>
        </Empty>
      )}
      <BankAccountList accounts={data} />
    </div>
  )
}
