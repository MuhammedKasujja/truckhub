import { UserForm } from "@/features/users/components/user-form"
import { userProfileQueryOptions } from "@/features/users/query-options"
import { useFetchEror } from "@/hooks/use-fetch-error"
import { hasPermission } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/users/$userId/edit")({
  component: RouteComponent,
  beforeLoad: () => hasPermission("users:edit"),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(userProfileQueryOptions(params.userId)),
})

function RouteComponent() {
  const { data: user, error } = Route.useLoaderData()
  useFetchEror(error)
  return <UserForm initialData={user} />
}
