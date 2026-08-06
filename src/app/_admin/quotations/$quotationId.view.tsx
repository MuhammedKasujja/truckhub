import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary"
import { PageAction, PageHeader, PageTitle } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  DistanceLineItemListItem,
  RouteLineItemListItem,
  ServiceLineItemListItem,
} from "@/features/quotations/components"
import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { QuotationVersion } from "@/features/quotations/types"
import { useBackNavigation } from "@/hooks/use-back-navigation"
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
  const back = useBackNavigation()

  useEffect(() => {
    setActiveVersion(quotation.versions.at(0))
  }, [quotation])

  return (
    <div className="space-y-4">
      <PageHeader className="pb-0">
        <PageTitle>
          Quotation <Badge variant={'outline'}>v{quotation.versions.length}</Badge>
        </PageTitle>
        <PageAction className="flex gap-2">
          <Button variant={"outline"} onClick={back}>
            Back
          </Button>
        </PageAction>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>{quotation?.number} <Badge>{quotation?.status}</Badge></CardTitle>
          <CardDescription>
            {/* <Badge>{quotation?.status}</Badge> */}
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
                <div
                  key={lineitem.unit_price}
                  className="rounded-lg border border-dashed p-4"
                >
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
          <div className="grid md:grid-cols-2">
            <div className="col-span-1"></div>
            <div className="col-span-1 space-y-2 mt-2">
              <div className="flex justify-between">
                <div>Subtotal</div>
                <div>{formatMoney(activeVersion?.subtotal)}</div>
              </div>
              <div className="flex justify-between">
                <div>Tax</div>
                <div>{formatMoney(activeVersion?.tax_amount)}</div>
              </div>
              <div className="flex justify-between">
                <div>Total</div>
                <div className="font-semibold">{formatMoney(activeVersion?.total_amount)}</div>
              </div>
              <Separator/>
              <Separator/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
