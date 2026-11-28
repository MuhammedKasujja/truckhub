import { createFileRoute } from "@tanstack/react-router"
import { PositionList } from "@/features/hr/components/position-list"
import { positionsQueryOptions } from "@/features/hr/query-options"
import { requirePermission } from "@/lib/auth"

export const Route = createFileRoute("/_admin/hr/positions/")({
  beforeLoad: () => requirePermission("hr:positions:manage"),
  component: PositionList,
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(positionsQueryOptions())
  },
})
