import { createFileRoute } from "@tanstack/react-router"
import {
  IslandList,
  IslandListSkeleton,
} from "@/features/settings/islands/components/island-list"
import { islandsQueryOptions } from "@/features/settings/islands/query-options"
import { islandListSearchSchema } from "@/features/settings/islands/schemas"

export const Route = createFileRoute("/_admin/settings/islands/")({
  component: IslandList,
  pendingComponent: IslandListSkeleton,
  validateSearch: islandListSearchSchema,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(islandsQueryOptions()),
})
