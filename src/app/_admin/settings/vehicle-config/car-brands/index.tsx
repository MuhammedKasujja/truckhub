import { createFileRoute } from "@tanstack/react-router"
import { CarBrandList } from "@/features/settings/vehicle-config/car-brand/components"
import { createCarBrandsQueryOptions } from "@/features/settings/vehicle-config/car-brand/query-options"
import { CarBrandSearchParamsCache } from "@/features/settings/vehicle-config/car-brand/schemas"
import { ConfigGridSkeleton } from "@/features/settings/vehicle-config/_components/config-ui"

export const Route = createFileRoute(
  "/_admin/settings/vehicle-config/car-brands/"
)({
  component: CarBrandList,
  pendingComponent: ConfigGridSkeleton,
  validateSearch: CarBrandSearchParamsCache,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps: search }) =>
    context.queryClient.ensureQueryData(createCarBrandsQueryOptions(search)),
})
