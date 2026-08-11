import {
  PageAction,
  PageBackButton,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QuotationPdf } from "@/features/quotations/components/quotation-pdf"
import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

export const Route = createFileRoute("/_admin/quotations/$quotationId/pdf")({
  component: RouteComponent,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      quotationDetailsQueryOptions(params.quotationId)
    ),
})

function RouteComponent() {
  const { quotationId } = Route.useParams()
  const { data: quotation } = Route.useLoaderData()
  const [activeVersion, setActiveVersion] = useState<string>()
  return (
    <div>
      <PageHeader className="pb-0">
        <PageTitle>{quotation.number} · Pdf</PageTitle>
        <PageAction className="flex gap-2">
          <PageBackButton />
          <Select
            value={activeVersion}
            onValueChange={(v) => {
              setActiveVersion(v)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quotation.versions.map((v) => (
                <SelectItem
                  key={v.version_number}
                  value={v.version_number.toString()}
                >
                  v{v.version_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </PageAction>
      </PageHeader>
      <QuotationPdf quotationId={quotationId} />
    </div>
  )
}
