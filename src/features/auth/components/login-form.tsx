import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import { useTranslation } from "@/i18n"
import { useNavigate, useSearch } from "@tanstack/react-router"
import z from "zod"
import { toast } from "sonner"
import { loginFn } from "@/features/auth/services"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { EmailField, PasswordField } from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { LoginSchema } from "@/features/auth/schemas"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { checkUserModuleAccess } from "@/features/auth/utils"

export function LoginForm() {
  const navigate = useNavigate()
  const search = useSearch({ from: "/_auth/login" })
  const queryInvalidator = useQueryInvalidator()

  const tr = useTranslation()

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
  })

  const shouldRedirectToLogin = search.redirect && search.redirect !== "/"

  async function onSubmit(values: z.infer<typeof LoginSchema>) {
    const { isSuccess, error, data } = await loginFn({ data: values })
    if (isSuccess && data) {
      toast.success(`${tr("login_successfully")}`)
      queryInvalidator.session.refresh()
      const { redirect, replace } = await checkUserModuleAccess()
      const loginRedirect = shouldRedirectToLogin ? search.redirect : redirect
      navigate({ to: loginRedirect, replace })
    } else {
      toast.error(error!.message)
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="grid p-0 md:grid-cols-2">
        <form className="p-6 md:p-8" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">{tr("welcome_back")}</h1>
              <p className="text-balance text-muted-foreground">
                {tr("welcome_back_info")}
              </p>
            </div>
            <EmailField
              label={tr("common.form.email")}
              name={"email"}
              control={form.control}
              placeholder="user@mail.com"
            />
            <PasswordField
              label={tr("common.form.password")}
              name={"password"}
              control={form.control}
              placeholder="********"
            />
            <Field>
              <SubmitButton
                text={tr("common.form.login")}
                isSubmitting={form.formState.isSubmitting}
              />
            </Field>
          </FieldGroup>
        </form>
        <div className="relative hidden bg-muted md:block">
          <img
            src="/global.svg"
            alt="logo"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </CardContent>
    </Card>
  )
}
