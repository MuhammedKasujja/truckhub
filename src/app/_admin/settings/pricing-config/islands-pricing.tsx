import { createFileRoute } from "@tanstack/react-router"
import { IconSandbox } from "@tabler/icons-react"
import { Can } from "@/components/has-permission"
import { CompanyIslandsPricingConfigurationDialog } from "@/features/settings/pricing/components/island-pricing/island-pricing-configurations"
import { IslandPricingTable } from "@/features/settings/pricing/components/island-pricing/island-pricing-table"
import { useCompanyActiveIslandsPricing } from "@/features/settings/pricing/hooks/use-island-pricing"
import { companyActiveIslandPricingQueryOptions } from "@/features/settings/pricing/query-options"
import { formatPricingDate } from "@/features/settings/pricing/utils/pricing-dates"
import { SettingsSection } from "@/features/settings/_components/settings-ui"

export const Route = createFileRoute(
  "/_admin/settings/pricing-config/islands-pricing"
)({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(companyActiveIslandPricingQueryOptions())
  },
})

function RouteComponent() {
  const { data, isLoading } = useCompanyActiveIslandsPricing()

  return (
    <SettingsSection
      icon={IconSandbox}
      title="Island pricing"
      description={
        data?.validFromDate
          ? `Active version · effective ${formatPricingDate(data.validFromDate)}`
          : "A price per island"
      }
      action={
        <Can permission="config:pricing:manage">
          <CompanyIslandsPricingConfigurationDialog />
        </Can>
      }
      contentClassName="p-0"
    >
      <IslandPricingTable
        pricings={data?.pricings}
        isLoading={isLoading}
        emptyDescription="No island prices are active. Use Manage versions to create one and set it active."
        className="rounded-none border-0 shadow-none"
      />
    </SettingsSection>
  )
}
