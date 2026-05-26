import { NotFound } from "@/components/not-found"
import {
  PageAction,
  PageBackButton,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ClientRouteTonnagePricingModal } from "@/features/clients/components"
import { CustomerDetailsWrapper } from "@/features/clients/components/customer-details-wrapper"
import {
  clientBookingsQueryOptions,
  clientPaymentsQueryOptions,
  clientProfileQueryOptions,
  clientRidesQueryOptions,
} from "@/features/clients/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { hasPermission } from "@/lib/auth"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/clients/$clientId/view")({
  component: RouteComponent,
  errorComponent: NotFound,
  beforeLoad: () => hasPermission("clients:view"),
  loader: async ({ context: { queryClient }, params }) => {
    const clientId = params.clientId
    queryClient.ensureQueryData(clientPaymentsQueryOptions(clientId))
    queryClient.ensureQueryData(clientBookingsQueryOptions(clientId))
    queryClient.ensureQueryData(clientRidesQueryOptions(clientId))
    return queryClient.ensureQueryData(clientProfileQueryOptions(clientId))
  },
})

function RouteComponent() {
  const { error, data } = Route.useLoaderData()
  const { clientId } = Route.useParams()
  useFetchEror(error)
  return (
    <div>
      <PageHeader>
        <PageTitle>{data?.fullname}</PageTitle>
        <PageAction className="flex gap-2">
          <PageBackButton />
          <Button asChild variant={"secondary"}>
            <Link to="/clients/data/$clientId" params={{ clientId }}>
              Pricing
            </Link>
          </Button>
          <Button asChild variant={"secondary"}>
            <Link to="/clients/$clientId/pdf" params={{ clientId }}>
              Pdf
            </Link>
          </Button>
          <ClientRouteTonnagePricingModal clientId={clientId} />
        </PageAction>
      </PageHeader>
      <CustomerDetailsWrapper clientId={clientId} />
    </div>
  )
}
