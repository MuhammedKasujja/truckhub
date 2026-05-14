import { CarBrandTable } from "@/features/settings/car-brand/components/car-brand-table"
import { createCarBrandsQueryOptions } from "@/features/settings/car-brand/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/car-brands/"
)({
  component: RouteComponent,
  loader: ({ context, location }) =>
    context.queryClient.ensureQueryData(
      createCarBrandsQueryOptions(location.search)
    ),
})

function RouteComponent() {
  return <CarBrandTable />
}
