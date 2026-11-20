import { createFileRoute } from "@tanstack/react-router"
import type { SettingsTab } from "@/features/settings/_components/settings-tabs"
import { SettingsTabsLayout } from "@/features/settings/_components/settings-tabs"
import { companyPricingDatesQueryOptions } from "@/features/settings/pricing/query-options"

const pricingTabs: SettingsTab[] = [
  { label: "Route pricing", to: "/settings/pricing-config/route-tonnage-pricing" },
  { label: "Distance pricing", to: "/settings/pricing-config/distance-pricing" },
  {
    label: "Loading & offloading fees",
    to: "/settings/pricing-config/loading-offloading-pricing",
  },
  { label: "Island pricing", to: "/settings/pricing-config/islands-pricing" },
]

export const Route = createFileRoute("/_admin/settings/pricing-config")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(companyPricingDatesQueryOptions())
  },
})

function RouteComponent() {
  return <SettingsTabsLayout tabs={pricingTabs} />
}
