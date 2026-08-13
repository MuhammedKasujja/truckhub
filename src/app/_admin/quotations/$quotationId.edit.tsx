import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { QuotationForm } from "@/features/quotations/components"
import { getEditableQuotation } from "@/features/quotations/utils"
import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { IDSchema } from "@/schemas"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import z from "zod"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { useEditQuotation } from "@/features/quotations/hooks/use-edit-quotation"
import { useQuotaionDetailsSuspenseQuery } from "@/features/quotations/hooks/use-quotation"

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
  const { quotationId } = Route.useParams()
  const { data: quotation } = useQuotaionDetailsSuspenseQuery(quotationId)
  const back = useBackNavigation()
  const { editQuotation } = useEditQuotation()
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader>
        <PageTitle>
          Edit Quotation{" "}
          <Badge variant={"outline"}>v{quotation.versions.length}</Badge>
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
        onSubmit={(data) =>
          editQuotation(
            { ...data, quotationId },
            {
              onSuccess() {
                navigate({
                  to: "/quotations/$quotationId/view",
                  params: { quotationId },
                })
              },
            }
          )
        }
      />
    </div>
  )
}
