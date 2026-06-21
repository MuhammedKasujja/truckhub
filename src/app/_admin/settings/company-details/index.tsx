import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CompanyDetailsView } from "@/features/settings/company-details/components"
import { settingsQueryOptions } from "@/features/settings/query-options"
import { createFileRoute } from "@tanstack/react-router"
import { SquareDotIcon } from "lucide-react"

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
      <Card>
        <CardHeader>
          <CardTitle>Quotation Terms</CardTitle>
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
