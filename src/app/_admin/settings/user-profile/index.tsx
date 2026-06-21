import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChangePasswordForm } from "@/features/auth/components"
import { UserProfileView } from "@/features/users/components"
import { userProfileQueryOptions } from "@/features/users/query-options"
import { requireAuth } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_admin/settings/user-profile/")({
  component: RouteComponent,
  beforeLoad: () => requireAuth(),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      userProfileQueryOptions(context.user.id)
    ),
})

function RouteComponent() {
  const { data: user, error } = Route.useLoaderData()
  if (!user) {
    return <div>Failed to load user profile {error?.message}</div>
  }
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList>
        <TabsTrigger value={"profile"}>User Profile</TabsTrigger>
        <TabsTrigger value={"change-password"}>Password Change</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <UserProfileView user={user} />
      </TabsContent>
      <TabsContent value="change-password">
        <ChangePasswordForm />
      </TabsContent>
    </Tabs>
  )
}
