import { CarBrandTable } from "@/features/settings/car-brand/components/car-brand-table"
import { createCarBrandsQueryOptions } from "@/features/settings/car-brand/query-options"
import { CarBrandSearchParamsCache } from "@/features/settings/car-brand/schemas"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/car-brands/"
)({
  component: RouteComponent,
  validateSearch: CarBrandSearchParamsCache,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps: search}) =>
    context.queryClient.ensureQueryData(
      createCarBrandsQueryOptions(search)
    ),
})

function RouteComponent() {
  return <CarBrandTable />
}
