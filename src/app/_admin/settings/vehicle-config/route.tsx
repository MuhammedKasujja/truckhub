import { createFileRoute, Outlet } from "@tanstack/react-router"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocation, useRouter } from "@tanstack/react-router"
import { Route as CarBrandsRoute } from "@/app/_admin/settings/vehicle-config/car-brands"
import { Route as CarModelsRoute } from "@/app/_admin/settings/vehicle-config/car-models"
import { Route as DriverTrainsRoute } from "@/app/_admin/settings/vehicle-config/drive-trains"
import { Route as TonnagesRoute } from "@/app/_admin/settings/vehicle-config/tonnages"
import { Route as VehicleTypesRoute } from "@/app/_admin/settings/vehicle-config/vehicle-types"

const vehicleConfigSections = [
  {
    name: "Car Makes",
    route: CarBrandsRoute.to,
  },
  {
    name: "Car Models",
    route: CarModelsRoute.to,
  },
  {
    name: "Drive Trains",
    route: DriverTrainsRoute.to,
  },
  {
    name: "Vehicle Types",
    route: VehicleTypesRoute.to,
  },
  {
    name: "Tonnages",
    route: TonnagesRoute.to,
  },
] as const

export const Route = createFileRoute("/_admin/settings/vehicle-config")({
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()
  const router = useRouter()

  console.log("Settings path", location.pathname)

  const activeTab = location.pathname ?? vehicleConfigSections[0].route
  return (
    <Tabs
      value={activeTab}
      className="w-full"
      onValueChange={(route) => router.navigate({ to: route })}
    >
      <TabsList>
        {vehicleConfigSections.map((section) => (
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
