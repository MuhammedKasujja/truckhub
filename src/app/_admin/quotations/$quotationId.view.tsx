import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { formatMoney } from "@/lib/format"
import { createFileRoute } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"

export const Route = createFileRoute("/_admin/quotations/$quotationId/view")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      quotationDetailsQueryOptions(params.quotationId)
    )
  },
})

function RouteComponent() {
  const { data: quotation } = Route.useLoaderData()
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{quotation?.number}</CardTitle>
          <CardDescription>
            <Badge>{quotation?.status}</Badge>
          </CardDescription>
          <CardAction>
            {quotation.status != "accepted" && (
              <Button>
                <PlusIcon />
                New Revision
              </Button>
            )}
          </CardAction>
        </CardHeader>
      </Card>
      <div className="grid gap-5 md:grid-cols-5">
        <div className="md:col-span-2">
          {quotation?.versions.map((ver) => (
            <div
              key={ver.version_number}
              className="space-y-2 rounded-lg border border-dashed p-4"
            >
              <div>Version: {ver.version_number}</div>
              <div>Date: {ver.start_date}</div>
              <div>Amount: {formatMoney(ver.total_amount)}</div>
              <div>Line items: {ver.line_items.length}</div>
            </div>
          ))}
        </div>
        <div className="md:col-span-3"></div>
      </div>
    </div>
  )
}
