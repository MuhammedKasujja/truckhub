import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { QuotationForm } from "@/features/quotations/components"
import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/quotations/$quotationId/edit")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      quotationDetailsQueryOptions(params.quotationId)
    )
  },
})

function RouteComponent() {
  return (
    <div>
      <PageHeader>
        <PageTitle>Edit Quotation</PageTitle>
        <PageAction className="flex gap-2">
          <Button variant={"outline"}>Cancel</Button>
          <Button type="submit" form="form-quotation">
            Submit
          </Button>
        </PageAction>
      </PageHeader>
      <QuotationForm onSubmit={(data) => {}} />
    </div>
  )
}
