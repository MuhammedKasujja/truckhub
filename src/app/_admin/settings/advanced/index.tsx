import { EditSettingsForm } from "@/features/settings"
import { createSettingsQueryOptions } from "@/features/settings/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/advanced/")({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(createSettingsQueryOptions()),
})

function RouteComponent() {
  const { data: settings } = Route.useLoaderData()
  return (
    <div className="flex h-full flex-col gap-6">
      <h1 className="text-2xl font-bold">Advanced Settings</h1>
      <EditSettingsForm settings={settings} />
    </div>
  )
}
