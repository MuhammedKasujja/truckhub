import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { ClientForm } from "@/features/clients/components"
import { useEditClient } from "@/features/clients/hooks/use-client"
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
  const { clientId } = Route.useParams()
  useFetchEror(error)
  const { editClient } = useEditClient()
  return (
    <ClientForm
      mode="edit"
      defaultValues={{ ...data, id: clientId }}
      onSubmit={(data) => {
        editClient({ ...data, id: clientId })
      }}
    />
  )
}
