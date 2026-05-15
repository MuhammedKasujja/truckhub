import { NotFound } from "@/components/not-found"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
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
  const params = Route.useParams()
  useFetchEror(error)
  return (
    <div>
      <PageHeader>
        <PageTitle>{data?.fullname}</PageTitle>
        <PageAction>
          <Button asChild variant={"secondary"}>
            <Link to="/clients/rates">Rates</Link>
          </Button>
          <Button asChild variant={"secondary"}>
            <Link to="/clients/pricing-rates">Client Rates</Link>
          </Button>
          <Button asChild variant={"secondary"}>
            <Link to="/clients/pricing">Pricing</Link>
          </Button>
        </PageAction>
      </PageHeader>
      <CustomerDetailsWrapper clientId={params.clientId} />
    </div>
  )
}
