import { createFileRoute } from "@tanstack/react-router"
import { SettingsTabsLayout } from "@/features/settings/_components/settings-tabs"
import { useTranslation } from "@/i18n"

export const Route = createFileRoute("/_admin/settings/vehicle-config")({
  component: VehicleConfigurationsLayout,
})

function VehicleConfigurationsLayout() {
  const tr = useTranslation()
  return (
    <SettingsTabsLayout
      tabs={[
        { label: tr("settings.carMakes"), to: "/settings/vehicle-config/car-brands" },
        { label: tr("settings.carModels"), to: "/settings/vehicle-config/car-models" },
        { label: tr("settings.driveTrains"), to: "/settings/vehicle-config/drive-trains" },
        { label: tr("settings.vehicleCategories"), to: "/settings/vehicle-config/vehicle-types" },
        // Tonnages: /settings/vehicle-config/tonnages (hidden for now)
      ]}
    />
  )
}
