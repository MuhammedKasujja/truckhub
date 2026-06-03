import { Can } from "@/components/has-permission"
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
import { PlusIcon } from "lucide-react"

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
        <PageTitle className="capitalize">{data?.name}</PageTitle>
        <PageAction className="flex gap-2">
          <PageBackButton />
          <Can permission={"bookings:create"}>
            <Button asChild size={"sm"} variant={"secondary"}>
              <Link to={"/bookings/new"} params={{ clientId }}>
               <PlusIcon/>
                New Booking
              </Link>
            </Button>
          </Can>
          <Can permission={"rides:create"}>
            <Button asChild size={"sm"} variant={"secondary"}>
              <Link to={"/rides/new"} params={{ clientId }}>
                <PlusIcon/>
                New Ride
              </Link>
            </Button>
          </Can>
          {data?.has_pricing && (
            <Button asChild variant={"secondary"} size="sm">
              <Link to="/clients/data/$clientId" params={{ clientId }}>
                Pricing
              </Link>
            </Button>
          )}
          <Button asChild variant={"secondary"} size="sm">
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
