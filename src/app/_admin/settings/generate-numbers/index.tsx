import { EntityNumbersWrapper } from "@/features/settings/entity-numbers/components"
import { entityNumberPatternsQueryOptions } from "@/features/settings/entity-numbers/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/generate-numbers/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(entityNumberPatternsQueryOptions())
  },
})

function RouteComponent() {
  const { data, isLoading } = useQuery(entityNumberPatternsQueryOptions())
  if (isLoading || !data?.data) {
    return <div>Loading data....</div>
  }

  useFetchEror(data.error)

  return <EntityNumbersWrapper patterns={data.data} />
}
