import { ServiceForm } from "@/features/services/components/service-form"
import { ServiceCreateSchemaInput } from "@/features/services/schemas"
import { createServiceFn } from "@/features/services/services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute("/_admin/services/new/")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("services:create"),
})

function RouteComponent() {
  const queryInvalidator = useQueryInvalidator()

  async function onSubmit(data: ServiceCreateSchemaInput) {
    const { isSuccess, error, message } = await createServiceFn({ data })
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.services.list.invalidate()
    } else {
      toast.error(error?.message)
    }
  }
  return <ServiceForm mode="create" onSubmit={onSubmit} />
}
