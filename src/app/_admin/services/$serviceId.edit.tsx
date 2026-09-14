import { ServiceForm } from "@/features/services/components/service-form"
import { serviceDetailsQueryOptions } from "@/features/services/query-options"
import { ServiceUpdateSchemaInput } from "@/features/services/schemas"
import { updateServiceFn } from "@/features/services/services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute("/_admin/services/$serviceId/edit")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("services:edit"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      serviceDetailsQueryOptions(params.serviceId)
    ),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  const queryInvalidator = useQueryInvalidator()

  async function onSubmit(data: ServiceUpdateSchemaInput) {
    const { isSuccess, error, message } = await updateServiceFn({ data })
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.services.list.invalidate()
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <ServiceForm mode="edit" defaultValues={{ ...data }} onSubmit={onSubmit} />
  )
}
