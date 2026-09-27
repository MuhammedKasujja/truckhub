import {
  RoutePricingDataGridForm,
  RouteTonnagePricingGrid,
} from "@/features/settings/pricing/components"
import {
  BatchPricingPayload,
  PricingSearchParams,
} from "@/features/settings/pricing/schemas"
import { toast } from "sonner"
import { createClientBatchRoutePricingFn } from "../services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { Activity, useState } from "react"
import { ActionIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { FieldLabel } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"

type ClientPricingProps = {
  clientId: string
}

export function ClientRouteTonnagePricingModal({
  clientId,
}: ClientPricingProps) {
  const queryInvaidator = useQueryInvalidator()
  const [view, setView] = useState<"list" | "edit">("list")
  const [search, setSearch] = useState<PricingSearchParams>()

  // const { data: clientPricings } = useQuery(
  //   companyRoutePricingQueryOptions(search)
  // )
  const referenceDate = "" //clientPricings?.effective_date

  async function handleSubmit(values: BatchPricingPayload) {
    const { error, isSuccess, message } = await createClientBatchRoutePricingFn(
      {
        data: { ...values, client_id: clientId },
      }
    )
    if (isSuccess && message) {
      toast.success(message)
      queryInvaidator.clients.profile(clientId).routePricing.invalidate()
    }
    if (error) {
      toast.error(error.message)
    }
  }
  return (
    <>
      <Activity mode={view == "list" ? "visible" : "hidden"}>
        <div className="flex items-baseline-last justify-between pb-4">
          <div className="grid grid-flow-col items-baseline-last gap-1.5">
            <div className="space-y-2">
              <FieldLabel htmlFor="date">
                Select pricing date{" "}
                {/* {data?.route_tonnage.active_date === referenceDate && ( */}
                <Badge>Current</Badge>
                {/* )} */}
              </FieldLabel>
              <Select
                value={referenceDate}
                onValueChange={(date) => {
                  setSearch({ ...search, referenceDate: date })
                }}
              >
                <SelectTrigger className="min-w-48" id="date">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* {data?.route_tonnage.dates.map((date) => (
                    <SelectItem key={date} value={date}>
                      {date}
                    </SelectItem>
                  ))} */}
                </SelectContent>
              </Select>
            </div>
            {/* {data?.route_tonnage.active_date !== referenceDate && (
              <Button
                type="button"
                disabled={isPending}
                onClick={() => {
                  if (search?.referenceDate)
                    activateRoutePricing({
                      effectiveDate: search?.referenceDate,
                    })
                }}
              >
                Set Active
              </Button>
            )} */}
          </div>
          <Button
            variant={"secondary"}
            type="button"
            onClick={() => setView("edit")}
          >
            <ActionIcon action="create" />
            New Configuration
          </Button>
        </div>
        <RouteTonnagePricingGrid
          routes={[]}
          effectiveDate={new Date().toDateString()}
          title={"Current Client Pricing"}
        />
      </Activity>
      <Activity mode={view == "edit" ? "visible" : "hidden"}>
        <RoutePricingDataGridForm
          onSubmit={handleSubmit}
          onCancel={() => setView("list")}
        />
      </Activity>
    </>
  )
}
