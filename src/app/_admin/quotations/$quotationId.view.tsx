import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
import { formatMoney } from "@/lib/format"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/quotations/$quotationId/view")({
  component: RouteComponent,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      quotationDetailsQueryOptions(params.quotationId)
    )
  },
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  return (
    <div>
      <div>{data?.number}</div>
      {data?.versions.map((ver) => (
        <div key={ver.version_number} className="border-dashed border space-y-2 p-4 rounded-lg">
          <div>Version: {ver.version_number}</div>
          <div>Date: {ver.valid_until}</div>
          <div>Amount: {formatMoney(ver.total)}</div>
          <div>Line items: {ver.line_items.length}</div>
          <div>Purpose: {ver.purpose??"-"}</div>
        </div>
      ))}
    </div>
  )
}
