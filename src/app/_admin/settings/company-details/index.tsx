import { Can } from "@/components/has-permission"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  EditInvoiceTermsForm,
  EditQuotationTermsForm,
} from "@/features/settings/_components"
import { CompanyDetailsView } from "@/features/settings/company-details/components"
import { settingsQueryOptions } from "@/features/settings/query-options"
import { createFileRoute } from "@tanstack/react-router"
import { SquareDotIcon } from "lucide-react"

function transformToTerms(terms?: string[] | null) {
  return terms?.map((t) => ({ value: t })) ?? []
}

export const Route = createFileRoute("/_admin/settings/company-details/")({
  component: RouteComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(settingsQueryOptions()),
})

function RouteComponent() {
  const { data: settings } = Route.useLoaderData()

  if (!settings) {
    return "Failed to load"
  }

  return (
    <div className="flex flex-col gap-5">
      <CompanyDetailsView company={settings?.company} />
      <Card>
        <CardHeader>
          <CardTitle>Invoice Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings?.invoice_terms?.map((term) => (
              <div
                className="flex items-center gap-2 text-muted-foreground"
                key={term}
              >
                <SquareDotIcon className="h-3 w-3 text-muted-foreground" />
                <p>{term}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Can permission="config:payment_terms:edit">
        <EditInvoiceTermsForm
          initialData={{
            invoiceTerms: transformToTerms(settings.invoice_terms),
            quotationTerms: transformToTerms(settings.quotation_terms),
          }}
        />
      </Can>
      <Card>
        <CardHeader>
          <CardTitle>Quotation Terms</CardTitle>
          <CardAction>
            <Can permission="config:payment_terms:edit">
              <EditQuotationTermsForm
                initialData={{
                  invoiceTerms: transformToTerms(settings.invoice_terms),
                  quotationTerms: transformToTerms(settings.quotation_terms),
                }}
              />
            </Can>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings?.quotation_terms?.map((term) => (
              <div
                className="flex items-center gap-2 text-muted-foreground"
                key={term}
              >
                <SquareDotIcon className="h-3 w-3 text-muted-foreground" />
                <p>{term}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
