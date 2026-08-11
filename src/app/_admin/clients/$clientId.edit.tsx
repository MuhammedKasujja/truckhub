import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { ClientForm } from "@/features/clients/components"
import { clientEditQueryOptions } from "@/features/clients/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/clients/$clientId/edit")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  beforeLoad: () => requirePermission("clients:edit"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      clientEditQueryOptions(params.clientId)
    ),
})

function RouteComponent() {
  const { data, error } = Route.useLoaderData()
  useFetchEror(error)
  return <ClientForm initialData={data} />
}
