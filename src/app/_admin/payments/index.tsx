import { createFileRoute } from "@tanstack/react-router"
import { Can } from "@/components/has-permission"
import {
  PageAction,
  PageBackButton,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { Suspense } from "react"
import {
  paymentsQueryOptions,
  paymentStatisticsQueryOptions,
} from "@/features/payments/query-options"
import { useTranslation } from "@/i18n"
import { requirePermission } from "@/lib/auth"
import { PaymentSearchParamsCache } from "@/features/payments/schemas"
import {
  PaymentStatisticsCard,
  PaymentTable,
  PaymentTableSkeleton,
  EditPaymentModal,
} from "@/features/payments/components"

export const Route = createFileRoute("/_admin/payments/")({
  validateSearch: PaymentSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  component: RouteComponent,
  beforeLoad: () => requirePermission("payments:module"),
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    await queryClient.ensureQueryData(paymentsQueryOptions(search))
    return queryClient.ensureQueryData(paymentStatisticsQueryOptions())
  },
})

function RouteComponent() {
  const { data: statistics } = Route.useLoaderData()
  const tr = useTranslation()
  return (
    <Suspense fallback={<PaymentTableSkeleton />}>
      <PageHeader>
        <PageTitle>
          <PageBackButton />
          {tr("modules.payments")}
        </PageTitle>
        <PageAction>
          <Can permission={"payments:create"}>
            <EditPaymentModal
              initialData={{ type: "booking" }}
              trigger={
                <Button>
                  <PlusIcon />
                  {tr("payments.form.new_payment")}
                </Button>
              }
            />
          </Can>
        </PageAction>
      </PageHeader>
      <PaymentStatisticsCard statistics={statistics} />
      <PaymentTable />
    </Suspense>
  )
}
