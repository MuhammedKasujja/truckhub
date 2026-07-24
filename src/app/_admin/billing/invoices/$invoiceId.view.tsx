import { invoiceDetailsQueryOptions } from "@/features/invoices/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_admin/billing/invoices/$invoiceId/view"
)({
  component: RouteComponent,
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      invoiceDetailsQueryOptions(params.invoiceId)
    ),
})

function RouteComponent() {
  const { data } = Route.useLoaderData()
  return <div>{data.number}</div>
}
