import { EntityNumbersWrapper } from "@/features/settings/entity-numbers/components"
import { entityNumberPatternsQueryOptions } from "@/features/settings/entity-numbers/query-options"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/generate-numbers/")({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(entityNumberPatternsQueryOptions())
  },
})

function RouteComponent() {
  return <EntityNumbersWrapper />
}
