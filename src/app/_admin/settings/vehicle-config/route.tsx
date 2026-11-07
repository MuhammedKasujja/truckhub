import { createFileRoute } from "@tanstack/react-router"
import { Car, CarFront, Cog, Layers, Truck } from "lucide-react"
import { SettingsTabsLayout } from "@/features/settings/_components/settings-tabs"
import {
  SettingsPage,
  SettingsPageHeader,
} from "@/features/settings/_components/settings-ui"
import { useTranslation } from "@/i18n"

export const Route = createFileRoute("/_admin/settings/vehicle-config")({
  component: VehicleConfigurationsLayout,
})

function VehicleConfigurationsLayout() {
  const tr = useTranslation()
  return (
    <SettingsPage>
      <SettingsTabsLayout
        header={
          <SettingsPageHeader
            icon={Truck}
            title="Vehicle config"
            description="The makes, models and categories you pick from when registering vehicles and pricing services."
            bordered={false}
          />
        }
        tabs={[
          { label: tr("settings.carMakes"), icon: CarFront, to: "/settings/vehicle-config/car-brands" },
          { label: tr("settings.carModels"), icon: Car, to: "/settings/vehicle-config/car-models" },
          { label: tr("settings.driveTrains"), icon: Cog, to: "/settings/vehicle-config/drive-trains" },
          { label: tr("settings.vehicleCategories"), icon: Layers, to: "/settings/vehicle-config/vehicle-types" },
          // Tonnages: /settings/vehicle-config/tonnages (hidden for now)
        ]}
      />
    </SettingsPage>
  )
}
