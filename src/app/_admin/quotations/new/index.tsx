import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import { QuotationForm } from "@/features/quotations/components"
import { useCreateQuotation } from "@/features/quotations/hooks/use-edit-quotation"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { requirePermission } from "@/lib/auth"
import { IDSchema } from "@/schemas"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import z from "zod"

export const Route = createFileRoute("/_admin/quotations/new/")({
  validateSearch: z.object({
    clientId: IDSchema.optional(),
  }),
  component: RouteComponent,
  beforeLoad: () => requirePermission("quotations:create"),
})

function RouteComponent() {
  const navigate = useNavigate()
  const handleBack = useBackNavigation()
  const { createQuotation, isPending } = useCreateQuotation()

  return (
    <div>
      <PageHeader>
        <PageTitle>New Quotation</PageTitle>
        <PageAction className="flex gap-2">
          <Button variant={"outline"} onClick={handleBack}>
            Cancel
          </Button>
          <SubmitButton
            isSubmitting={isPending}
            type="submit"
            form="form-quotation"
            text="Create quotation"
          />
        </PageAction>
      </PageHeader>
      <QuotationForm
        onSubmit={async (values) => {
          createQuotation(values, {
            onSuccess: ({ data }) => {
              // toast.success("Quotation has been created successfully")
              navigate({
                from: "/quotations/$quotationId/view",
                params: { quotationId: data!.id },
              })
            },
          })
        }}
      />
    </div>
  )
}
