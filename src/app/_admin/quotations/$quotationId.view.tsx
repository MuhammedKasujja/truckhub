import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DistanceLineItemListItem,
  RouteLineItemListItem,
  ServiceLineItemListItem,
} from "@/features/quotations/components"
import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { QuotationVersion } from "@/features/quotations/types"
import { formatMoney } from "@/lib/format"
import { createFileRoute } from "@tanstack/react-router"
import { PlusIcon } from "lucide-react"
import { useEffect, useState } from "react"

export const Route = createFileRoute("/_admin/quotations/$quotationId/view")({
  component: RouteComponent,
  errorComponent: DefaultCatchBoundary,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      quotationDetailsQueryOptions(params.quotationId)
    )
  },
})

function RouteComponent() {
  const [activeVersion, setActiveVersion] = useState<QuotationVersion>()
  const { data: quotation } = Route.useLoaderData()

  useEffect(() => {
    setActiveVersion(quotation.versions.at(0))
  }, [quotation])

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
              onClick={() => setActiveVersion(ver)}
            >
              <div>Version: {ver.version_number}</div>
              <div>Date: {ver.start_date}</div>
              <div>Amount: {formatMoney(ver.total_amount)}</div>
              <div>Service Count: {ver.line_items.length}</div>
            </div>
          ))}
        </div>
        <div className="md:col-span-3">
          {activeVersion && (
            <div>
              {activeVersion.line_items.map((lineitem) => (
                <div key={lineitem.unit_price}>
                  {lineitem.source === "distance" && (
                    <DistanceLineItemListItem lineItem={lineitem} />
                  )}
                  {lineitem.source === "route" && (
                    <RouteLineItemListItem lineItem={lineitem} />
                  )}
                  {lineitem.source === "service" && (
                    <ServiceLineItemListItem lineItem={lineitem} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
