import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { QuotationForm } from "@/features/quotations/components"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/quotations/$quotationId/edit")({
  component: RouteComponent,
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
