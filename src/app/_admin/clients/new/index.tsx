import { EntityPickerSearchParams } from "@/common/schemas"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ClientForm } from "@/features/clients/components"
import { useCreateClient } from "@/features/clients/hooks/use-client"
import { useNavigationHistory } from "@/hooks/use-navigation-history"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/clients/new/")({
  component: RouteComponent,
  validateSearch: EntityPickerSearchParams,
  beforeLoad: () => requirePermission("clients:create"),
})

function RouteComponent() {
  const { goBack } = useNavigationHistory()
  const { createClient, prefill } = useCreateClient()
  return (
    <>
      <PageHeader>
        <PageTitle>New Client</PageTitle>
        <PageAction className="flex gap-2">
          <Button variant={"outline"} onClick={goBack}>
            Cancel
          </Button>
        </PageAction>
      </PageHeader>
      <ClientForm
        mode="create"
        defaultValues={prefill}
        onSubmit={(data) => {
          createClient(data)
        }}
      />
    </>
  )
}
