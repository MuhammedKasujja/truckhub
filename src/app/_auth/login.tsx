import { LoginForm } from "@/features/auth/components"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth/login")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
