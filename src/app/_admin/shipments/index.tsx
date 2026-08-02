import { Can } from "@/components/has-permission"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ShipmentTable } from "@/features/shipments/components"
import { shipmentsQueryOptions } from "@/features/shipments/query-options"
import { ShipmentSearchParams } from "@/features/shipments/schemas"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { MapIcon } from "lucide-react"

export const Route = createFileRoute("/_admin/shipments/")({
  component: RouteComponent,
  validateSearch: ShipmentSearchParams,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context, deps: { search } }) =>
    context.queryClient.ensureQueryData(shipmentsQueryOptions(search)),
})

function RouteComponent() {
  const search = Route.useSearch()
  const handleBack = useBackNavigation()

  const { data } = useQuery(shipmentsQueryOptions(search))
  return (
    <div>
      <PageHeader className="pb-4">
        <PageTitle>Shipments</PageTitle>
        <PageAction className="flex gap-2">
          <Button variant={"outline"} size={"sm"} onClick={handleBack}>
            Back
          </Button>
          <Can permission="rides:active">
            <Button size={"sm"} asChild>
              <Link to={"/shipments/live"}>
                <MapIcon />
                Live
              </Link>
            </Button>
          </Can>
        </PageAction>
      </PageHeader>
      <ShipmentTable data={data?.data} pagination={data?.pagination} />
    </div>
  )
}
