import { useNavigate, useSearch } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import type { LoginSchemaType } from "@/features/auth/schemas"
import { LoginSchema } from "@/features/auth/schemas"
import { loginFn } from "@/features/auth/services"
import { checkUserModuleAccess } from "@/features/auth/utils"
import { EmailField, PasswordField } from "@/components/ui/form-fields"
import { FieldGroup } from "@/components/ui/field"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { useTranslation } from "@/i18n"

export function LoginForm() {
  const tr = useTranslation()
  const navigate = useNavigate()
  const { redirect: requestedRedirect } = useSearch({ from: "/_auth/login" })
  const queryInvalidator = useQueryInvalidator()

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginSchemaType) {
    const { isSuccess, data, error } = await loginFn({ data: values })
    if (!isSuccess || !data) {
      toast.error(error?.message ?? tr("login_failed"))
      return
    }

    toast.success(tr("login_successfully"))
    queryInvalidator.session.refresh()

    // Send the user back to the page that bounced them here, unless it was the
    // root; otherwise land them on the first module they can access.
    const { redirect, replace } = await checkUserModuleAccess()
    const to =
      requestedRedirect && requestedRedirect !== "/"
        ? requestedRedirect
        : redirect
    navigate({ to, replace })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <EmailField
          label={tr("common.form.email")}
          name="email"
          control={form.control}
          placeholder="user@mail.com"
        />
        <PasswordField
          label={tr("common.form.password")}
          name="password"
          control={form.control}
          placeholder="••••••••"
        />
        <SubmitButton
          className="w-full"
          size="lg"
          text={tr("common.form.login")}
          isSubmitting={form.formState.isSubmitting}
        />
      </FieldGroup>
    </form>
  )
}
