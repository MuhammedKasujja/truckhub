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
} from "@/features/clients/components"
import { CustomerDetailsWrapper } from "@/features/clients/components/customer-details-wrapper"
import {
  clientBookingsQueryOptions,
  clientPaymentsQueryOptions,
  clientProfileQueryOptions,
  clientRidesQueryOptions,
} from "@/features/clients/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { requirePermission } from "@/lib/auth"
import { IconShieldStar } from "@tabler/icons-react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"

export const Route = createFileRoute("/_admin/clients/$clientId/view")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  beforeLoad: () => requirePermission("clients:view"),
  loader: async ({ context: { queryClient }, params }) => {
    const clientId = params.clientId
    queryClient.ensureQueryData(clientPaymentsQueryOptions(clientId))
    queryClient.ensureQueryData(clientBookingsQueryOptions(clientId))
    queryClient.ensureQueryData(clientRidesQueryOptions(clientId))
    return queryClient.ensureQueryData(clientProfileQueryOptions(clientId))
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const { clientId } = Route.useParams()
  return (
    <div>
      <PageHeader>
        <PageTitle className="capitalize">
          {data?.name}{" "}
          {data?.client_type === "premium" && (
            <IconShieldStar stroke={2} className="text-amber-400 size-5" />
          )}
        </PageTitle>
        <PageAction className="flex gap-2">
          <PageBackButton />
          <ButtonGroup>
            <Can permission={"quotations:create"}>
              <Button asChild variant={"secondary"}>
                <Link to={"/quotations/new"} search={{ clientId }}>
                  <PlusIcon />
                  Quotation
                </Link>
              </Button>
            </Can>
            <Can permission={"bookings:create"}>
              <Button asChild variant={"secondary"}>
                <Link to={"/bookings/new"} search={{ clientId }}>
                  <PlusIcon />
                  New Booking
                </Link>
              </Button>
            </Can>
            <Can permission={"rides:create"}>
              <Button asChild variant={"secondary"}>
                <Link to={"/rides/new"} params={{ clientId }}>
                  <PlusIcon />
                  New Ride
                </Link>
              </Button>
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
