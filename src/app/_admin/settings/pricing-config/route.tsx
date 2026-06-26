import { createFileRoute, Outlet, useLocation, useRouter } from "@tanstack/react-router"
import { Route as DistancePricingRoute } from "@/app/_admin/settings/pricing-config/distance-pricing"
import { Route as LoacationPricingRoute } from "@/app/_admin/settings/pricing-config/route-tonnage-pricing"
import { Route as LoadingOffloadingPricingRoute } from "@/app/_admin/settings/pricing-config/loading-offloading-pricing"
import { Route as IslandsPricingRoute } from "@/app/_admin/settings/pricing-config/islands-pricing"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const userManagementTabs = [
  {
    name: "Route Pricing",
    route: LoacationPricingRoute.to,
  },
  {
    name: "Distance Pricing",
    route: DistancePricingRoute.to,
  },
  {
    name: "Loading-Offloading Pricing",
    route: LoadingOffloadingPricingRoute.to,
  },
  {
    name: "Islands Pricing",
    route: IslandsPricingRoute.to,
  },
]

export const Route = createFileRoute("/_admin/settings/pricing-config")({
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()
  const router = useRouter()

  const activeTab = location.pathname ?? userManagementTabs[0].route
  return (
    <Tabs
      value={activeTab}
      className="w-full"
      onValueChange={(route) => router.navigate({ to: route })}
    >
      <TabsList>
        {userManagementTabs.map((section) => (
          <TabsTrigger key={section.name} value={section.route}>
            {section.name}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="mt-4">
        <Outlet />
      </div>
    </Tabs>
  )
}
