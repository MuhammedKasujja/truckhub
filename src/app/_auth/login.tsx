import { createFileRoute } from "@tanstack/react-router"
import { ShieldCheck, TruckIcon } from "lucide-react"
import z from "zod"
import { LoginForm } from "@/features/auth/components"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/i18n"

export const Route = createFileRoute("/_auth/login")({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const tr = useTranslation()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <TruckIcon className="size-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {tr("app_name")}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {tr("login_title")}
            </h1>
          </div>
        </div>

        <Card className="shadow-md">
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              {tr("welcome_back_info")}
            </p>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-center text-xs leading-5 text-balance text-muted-foreground">
          <ShieldCheck
            className="mr-1 inline-block size-3.5 align-[-0.2em]"
            aria-hidden
          />
          {tr("login_restricted_notice")}
        </p>
      </div>
    </div>
  )
}
