import { Button } from "@/components/ui/button"
import { logoutFn } from "@/features/auth/services"
import { createFileRoute, useRouter } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/unauthorized-module")({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()

  async function logoutUser() {
    await logoutFn()
    router.navigate({ to: "/login", replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-red-500">403</h1>

        <h2 className="mt-4 text-2xl font-semibold">Access Denied</h2>

        <p className="mt-2 text-gray-600">
          You don’t have permission to view this page.
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={logoutUser}>Logout</Button>
        </div>
      </div>
    </div>
  )
}
