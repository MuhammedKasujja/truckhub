import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { Can } from "@/components/has-permission"
import {
  PageAction,
  PageBackButton,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  ClientLoadingFeesModal,
  ClientRouteTonnagePricingModal,
  CustomerDetailsWrapper,
} from "@/features/clients/components"
import { useClientProfileSuspenseQuery } from "@/features/clients/hooks/use-client"
import {
  clientInvoicesQueryOptions,
  clientPaymentsQueryOptions,
  clientProfileQueryOptions,
  clientQuotationsQueryOptions,
} from "@/features/clients/query-options"
import { EnterPaymentModal } from "@/features/payments/components"
import { useTranslation } from "@/i18n"
import { requirePermission } from "@/lib/auth"
import { IconEdit, IconShieldStar } from "@tabler/icons-react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { FileTextIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/_admin/clients/$clientId/view")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  beforeLoad: () => requirePermission("clients:view"),
  loader: async ({ context: { queryClient }, params }) => {
    const clientId = params.clientId
    queryClient.ensureQueryData(clientPaymentsQueryOptions(clientId))
    queryClient.ensureQueryData(clientInvoicesQueryOptions(clientId))
    queryClient.ensureQueryData(clientQuotationsQueryOptions(clientId))
    return queryClient.ensureQueryData(clientProfileQueryOptions(clientId))
  },
})

function RouteComponent() {
  const { clientId } = Route.useParams()
  const { data } = useClientProfileSuspenseQuery(clientId)
  const [openModal, setOpenModal] = useState(false)

  const tr = useTranslation()
  return (
    <div>
      <PageHeader>
        <PageTitle className="capitalize">
          {data?.name}{" "}
          {data?.client_type === "premium" && (
            <IconShieldStar stroke={2} className="size-5 text-amber-400" />
          )}
        </PageTitle>
        <PageAction className="flex gap-2">
          <PageBackButton />
          <ButtonGroup>
            <Can permission={"clients:edit"}>
              <Button asChild variant={"secondary"} >
                <Link to={"/clients/$clientId/edit"} params={{ clientId }}>
                  <IconEdit />
                  Edit
                </Link>
              </Button>
            </Can>
            <Can permission={"quotations:create"}>
              <Button asChild variant={"secondary"}>
                <Link to={"/quotations/new"} search={{ clientId }}>
                  <PlusIcon />
                  New Quotation
                </Link>
              </Button>
            </Can>
            <Can permission={"invoices:create"}>
              <Button asChild variant={"secondary"}>
                <Link to={"/billing/invoices/new"} search={{ clientId }}>
                  <PlusIcon />
                  New Invoice
                </Link>
              </Button>
            </Can>
            <Can permission={"payments:create"}>
              <Button variant={"secondary"} onClick={() => setOpenModal(true)}>
                <PlusIcon />
                {tr("payments.form.enterPayment")}
              </Button>
              <EnterPaymentModal
                open={openModal}
                onOpenChange={() => setOpenModal(false)}
                initialData={{
                  type: "invoice",
                }}
              />
            </Can>
            {data?.has_pricing && (
              <Button asChild variant={"secondary"}>
                <Link to="/clients/data/$clientId" params={{ clientId }}>
                  Pricing
                </Link>
              </Button>
            )}
            <Button asChild variant={"secondary"}>
              <Link to="/clients/$clientId/pdf" params={{ clientId }}>
              <FileTextIcon/>
                Pdf
              </Link>
            </Button>
            <ClientRouteTonnagePricingModal clientId={clientId} />
            <ClientLoadingFeesModal
              clientId={clientId}
              clientName={data?.name}
            />
          </ButtonGroup>
        </PageAction>
      </PageHeader>
      <CustomerDetailsWrapper clientId={clientId} />
    </div>
  )
}
