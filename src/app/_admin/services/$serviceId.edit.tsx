import {
  PageAction,
  PageBackIconButton,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ServiceForm } from "@/features/services/components/service-form"
import { serviceDetailsQueryOptions } from "@/features/services/query-options"
import { ServiceUpdateSchemaInput } from "@/features/services/schemas"
import { updateServiceFn } from "@/features/services/services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { useTranslation } from "@/i18n"
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
  const tr = useTranslation()

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
    <>
      <PageHeader>
        <PageTitle>Edit Service</PageTitle>
        <PageAction>
          <PageBackIconButton></PageBackIconButton>
        </PageAction>
      </PageHeader>
      <Card>
        <CardContent>
          <ServiceForm
            mode="edit"
            defaultValues={{
              ...data,
              car_brand_id: data?.car_model?.car_brand.id,
            }}
            onSubmit={onSubmit}
          />
        </CardContent>
        <CardFooter>
          <Button form="service-form">{tr("common.form.submit")}</Button>
        </CardFooter>
      </Card>
    </>
  )
}
