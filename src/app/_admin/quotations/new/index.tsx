import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { QuotationForm } from "@/features/quotations/components"
import { createQuotationFn } from "@/features/quotations/services"
import { useBackNavigation } from "@/hooks/use-back"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { IDSchema } from "@/schemas"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import z from "zod"

export const Route = createFileRoute("/_admin/quotations/new/")({
  validateSearch: z.object({
    clientId: IDSchema.optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const queryInvalidator = useQueryInvalidator()
  const navigate = useNavigate()
  const handleBack = useBackNavigation()

  return (
    <div>
      <PageHeader>
        <PageTitle>New Quotation</PageTitle>
        <PageAction className="flex gap-2">
          <Button variant={"outline"} onClick={handleBack}>
            Cancel
          </Button>
          <Button type="submit" form="form-quotation">
            Submit
          </Button>
        </PageAction>
      </PageHeader>
      <QuotationForm
        onSubmit={async (values) => {
          const { isSuccess, error, data } = await createQuotationFn({
            data: values,
          })
          if (isSuccess) {
            toast.success("Quotation has been created successfully")
            queryInvalidator.quotations.list.invalidate()
            if (data) {
              navigate({
                from: "/quotations/$quotationId/view",
                params: { quotationId: data.id },
              })
            }
          } else {
            toast.error(error!.message)
          }
        }}
      />
    </div>
  )
}
