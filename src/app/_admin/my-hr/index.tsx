import { createFileRoute } from "@tanstack/react-router"
import { MyHr } from "@/features/hr/components/my-hr"
import { myStaffRecordQueryOptions } from "@/features/hr/query-options"
import { SettingsPageSkeleton } from "@/features/settings/_components/settings-ui"

// No permission check: the API only ever returns the caller's own data.
export const Route = createFileRoute("/_admin/my-hr/")({
  pendingComponent: SettingsPageSkeleton,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(myStaffRecordQueryOptions()),
  component: MyHr,
})
