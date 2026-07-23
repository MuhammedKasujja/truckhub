import { quotationDetailsQueryOptions } from "@/features/quotations/query-options"
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
  return <div>{data?.number}</div>
}
