import { createFileRoute } from "@tanstack/react-router"
import { ListChecks, SlidersHorizontal, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { EditSettingsForm } from "@/features/settings"
import {
  SectionEmpty,
  SettingsPage,
  SettingsPageHeader,
  SettingsPageSkeleton,
  SettingsSection,
} from "@/features/settings/_components/settings-ui"
import { useSettings } from "@/features/settings/hooks/use-settings"
import { useVehicleConfigurations } from "@/features/settings/hooks/use-vehicle-configurations"
import {
  createVehicleConfigurationsQueryOptions,
  settingsQueryOptions,
} from "@/features/settings/query-options"
import { EditVehicleFeatureForm } from "@/features/settings/vehicle-config/vehicle-features/components"
import { formatPlural } from "@/lib/format"

export const Route = createFileRoute("/_admin/settings/advanced/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(settingsQueryOptions())
    context.queryClient.prefetchQuery(createVehicleConfigurationsQueryOptions())
  },
})

function RouteComponent() {
  const { settings, isLoading, error } = useSettings()

  if (isLoading) return <SettingsPageSkeleton sections={3} />

  return (
    <SettingsPage>
      <SettingsPageHeader
        icon={SlidersHorizontal}
        title="Advanced"
        description="Company-wide preferences for formatting, numbering and vehicles."
      />

      {error || !settings ? (
        <SectionEmpty
          icon={TriangleAlert}
          title="Couldn't load settings"
          description={error?.message ?? "Refresh the page to try again."}
        />
      ) : (
        <EditSettingsForm settings={settings} />
      )}

      <VehicleFeaturesSection />
    </SettingsPage>
  )
}

function VehicleFeaturesSection() {
  const { data } = useVehicleConfigurations()
  const features = data?.features ?? []

  return (
    <SettingsSection
      icon={ListChecks}
      title="Vehicle features"
      description={`Options you can tick on a vehicle · ${formatPlural(features.length, { singular: "feature", plural: "features" })}`}
      action={<EditVehicleFeatureForm />}
    >
      {features.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No features yet. Use Manage to add some.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {features.map((feature) => (
            <li key={feature.id}>
              <Badge variant="outline" className="h-7 px-3 text-sm font-normal">
                {feature.name}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </SettingsSection>
  )
}
