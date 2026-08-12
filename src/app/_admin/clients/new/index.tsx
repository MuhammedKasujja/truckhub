import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ClientForm } from "@/features/clients/components"
import { useNavigationHistory } from "@/hooks/use-navigation-history"
import { requirePermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

export const Route = createFileRoute("/_admin/clients/new/")({
  component: RouteComponent,
  validateSearch: z.object({
    prefill: z.string().optional(),
    returnTo: z.string().optional(),
    field: z.string().optional(),
  }),
  beforeLoad: () => requirePermission("clients:create"),
})

function RouteComponent() {
  const { prefill, returnTo, field } = Route.useSearch()

  const { goBack } = useNavigationHistory()
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
      <ClientForm />
    </>
  )
}
