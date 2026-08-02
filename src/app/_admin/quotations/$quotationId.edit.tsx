import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QuotationForm } from "@/features/quotations/components"
import { getEditableQuotation } from "@/features/quotations/utils"
import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { IDSchema } from "@/schemas"
import { createFileRoute } from "@tanstack/react-router"
import z from "zod"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"

export const Route = createFileRoute("/_admin/quotations/$quotationId/edit")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  validateSearch: z.object({
    clientId: IDSchema.optional(),
  }),
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      quotationDetailsQueryOptions(params.quotationId)
    )
  },
})

function RouteComponent() {
  const { data: quotation } = Route.useLoaderData()
  const back = useBackNavigation()

  return (
    <div>
      <PageHeader>
        <PageTitle>
          Edit Quotation <Badge>v{quotation.versions.length + 1}</Badge>
        </PageTitle>
        <PageAction className="flex gap-2">
          <Button variant={"outline"} onClick={back}>
            Cancel
          </Button>
          <Button type="submit" form="form-quotation">
            Submit
          </Button>
        </PageAction>
      </PageHeader>
      <QuotationForm
        initialData={getEditableQuotation(quotation)}
        onSubmit={(data) => {}}
      />
    </div>
  )
}
