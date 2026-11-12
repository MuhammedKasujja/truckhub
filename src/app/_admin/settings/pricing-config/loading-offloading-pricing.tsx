import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Forklift } from "lucide-react"
import { Can } from "@/components/has-permission"
import { LoadingOffloadingPricingTable } from "@/features/settings/pricing/components/loading-offloading-pricing/loading-offloading-pricing-table"
import { CompanyLoadingPricingConfigurationDialog } from "@/features/settings/pricing/components/loading-offloading-pricing/loading-pricing-configurations"
import { formatPricingDate } from "@/features/settings/pricing/components/loading-offloading-pricing/loading-fees-format"
import { activeLoadingFreesQueryOptions } from "@/features/settings/pricing/query-options"
import { PricingSearchParamsCache } from "@/features/settings/pricing/schemas"
import { SettingsSection } from "@/features/settings/_components/settings-ui"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/loading-offloading-pricing"
)({
  component: RouteComponent,
  validateSearch: PricingSearchParamsCache,
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(activeLoadingFreesQueryOptions())
  },
})

function RouteComponent() {
  const { data, isLoading } = useQuery(activeLoadingFreesQueryOptions())
  const active = data?.data

  return (
    <SettingsSection
      icon={Forklift}
      title="Loading & offloading fees"
      description={
        active?.effective_date
          ? `Active version · effective ${formatPricingDate(active.effective_date)}`
          : "Fee tiers by tonnage and volume"
      }
      action={
        <Can permission="config:pricing:manage">
          <CompanyLoadingPricingConfigurationDialog />
        </Can>
      }
      contentClassName="p-0"
    >
      <LoadingOffloadingPricingTable
        pricings={active?.pricings}
        isLoading={isLoading}
        emptyDescription="No loading fees are active. Use Manage versions to create one and set it active."
        className="rounded-none border-0"
      />
    </SettingsSection>
  )
}
