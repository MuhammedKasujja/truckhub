import { createFileRoute, Outlet } from "@tanstack/react-router"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocation, useRouter } from "@tanstack/react-router"

const vehicleConfigSections = [
  {
    name: "Car Makes",
    route: "/settings/car-brands",
  },
  {
    name: "Car Models",
    route: "/settings/car-models",
  },
  {
    name: "Drive Trains",
    route: "/settings/drive-trains",
  },
  {
    name: "Vehicle Types",
    route: "/settings/vehicle-types",
  },
  {
    name: "Tonnages",
    route: "/settings/tonnages",
  },
] as const

export const Route = createFileRoute("/_admin/settings/_vehicle-config")({
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
