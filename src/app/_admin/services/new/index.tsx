import {
  PageAction,
  PageBackIconButton,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ServiceForm } from "@/features/services/components/service-form"
import { ServiceCreateSchemaInput } from "@/features/services/schemas"
import { createServiceFn } from "@/features/services/services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { useTranslation } from "@/i18n"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

export const Route = createFileRoute("/_admin/services/new/")({
  component: RouteComponent,
  beforeLoad: () => requirePermission("services:create"),
})

function RouteComponent() {
  const queryInvalidator = useQueryInvalidator()
  const tr = useTranslation()

  async function onSubmit(data: ServiceCreateSchemaInput) {
    const { isSuccess, error, message } = await createServiceFn({ data })
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
        <PageTitle>New Service</PageTitle>
        <PageAction>
          <PageBackIconButton></PageBackIconButton>
        </PageAction>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardDescription>{tr("services.create_new_service")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm mode="create" onSubmit={onSubmit} />
        </CardContent>
        <CardFooter>
          <Button form="service-form">{tr("common.form.submit")}</Button>
        </CardFooter>
      </Card>
    </>
  )
}
