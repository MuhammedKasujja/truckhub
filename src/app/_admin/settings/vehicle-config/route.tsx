import { createFileRoute, Outlet } from "@tanstack/react-router"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocation, useRouter } from "@tanstack/react-router"
import { Route as CarBrandsRoute } from "@/app/_admin/settings/vehicle-config/car-brands"
import { Route as CarModelsRoute } from "@/app/_admin/settings/vehicle-config/car-models"
import { Route as DriverTrainsRoute } from "@/app/_admin/settings/vehicle-config/drive-trains"
import { Route as TonnagesRoute } from "@/app/_admin/settings/vehicle-config/tonnages"
import { Route as VehicleTypesRoute } from "@/app/_admin/settings/vehicle-config/vehicle-types"
import { useTranslation } from "@/i18n"

const vehicleConfigSections = [
  {
    name: "carMakes",
    route: CarBrandsRoute.to,
  },
  {
    name: "carModels",
    route: CarModelsRoute.to,
  },
  {
    name: "driveTrains",
    route: DriverTrainsRoute.to,
  },
  {
    name: "vehicleCategories",
    route: VehicleTypesRoute.to,
  },
  {
    name: "tonnages",
    route: TonnagesRoute.to,
  },
] as const

export const Route = createFileRoute("/_admin/settings/vehicle-config")({
  component: RouteComponent,
})

function RouteComponent() {
  const location = useLocation()
  const router = useRouter()
  const tr = useTranslation()

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
            {tr(`settings.${section.name}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="mt-4">
        <Outlet />
      </div>
    </Tabs>
  )
}
