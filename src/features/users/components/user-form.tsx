import { Link, useNavigate } from "@tanstack/react-router"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowLeft, IdCard, KeyRound, PenLine, UserPlus } from "lucide-react"
import { usersQueryKeys } from "../query-options"
import type z from "zod"
import type { UserUpdateSchemaType } from "@/features/users/schemas"
import { Field, FieldDescription } from "@/components/ui/field"
import {
  EmailField,
  PasswordField,
  TelephoneField,
  TextField,
} from "@/components/ui/form-fields"
import { Button } from "@/components/ui/button"
import { SubmitButton } from "@/components/ui/submit-button"
import SignaturePad from "@/components/ui/signature-pad"
import { useTranslation } from "@/i18n"
import {
  UserCreateSchema,
  UserUpdateSchema,
} from "@/features/users/schemas"
import { createUserFn, updateUserFn } from "@/features/users/services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { SettingsSection } from "@/features/settings/_components/settings-ui"

type UserFormProps = {
  initialData?: Partial<UserUpdateSchemaType>
}

export function UserForm({ initialData }: UserFormProps) {
  const tr = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const queryInvalidator = useQueryInvalidator()
  const isEdit = !!initialData?.id

  const formSchema = isEdit ? UserUpdateSchema : UserCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...initialData, phone: initialData?.phone ?? "" },
  })

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    const { isSuccess, error, message } =
      "id" in values
        ? await updateUserFn({ data: values })
        : await createUserFn({ data: values })

    if (!isSuccess) {
      toast.error(error?.message ?? "Couldn't save the user")
      return
    }
    toast.success(message)
    queryInvalidator.users.list.invalidate()
    if ("id" in values) {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(values.id) })
      navigate({
        to: "/settings/user-management/users/$userId/view",
        params: { userId: values.id },
      })
    } else {
      navigate({ to: "/settings/user-management/users" })
    }
  }

  const backLink = isEdit
    ? ({
        to: "/settings/user-management/users/$userId/view",
        params: { userId: initialData.id! },
      } as const)
    : ({ to: "/settings/user-management/users" } as const)

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Link
            {...backLink}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {isEdit ? "Back to user" : "All users"}
          </Link>
          <h2 className="text-lg font-bold tracking-tight">
            {isEdit ? tr("edit_user") : tr("new_user")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Update this user's name, contact details and signature."
              : "Set their details and a password. You can assign roles once the user is created."}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <SettingsSection icon={IdCard} title="Personal details">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={tr("common.form.first_name")}
              name="first_name"
              control={form.control}
            />
            <TextField
              label={tr("common.form.last_name")}
              name="last_name"
              control={form.control}
            />
            <EmailField
              label={tr("common.form.email")}
              name="email"
              control={form.control}
              placeholder="user@mail.com"
            />
            <TelephoneField
              label={tr("common.form.phone")}
              name="phone"
              control={form.control}
              required={true}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          icon={isEdit ? KeyRound : UserPlus}
          title="Sign-in"
          description={isEdit ? undefined : "Share the password with them securely"}
        >
          <div className="grid gap-4">
            <TextField
              label={tr("common.form.username")}
              name="username"
              control={form.control}
              placeholder="At least 4 letters"
              required={false}
            />
            {!isEdit && (
              <PasswordField
                label={tr("common.form.password")}
                name="password"
                control={form.control}
              />
            )}
          </div>
        </SettingsSection>
      </div>

      <SettingsSection
        icon={PenLine}
        title="Signature"
        description="Optional. Used where documents need this user's signature"
      >
        <Controller
          control={form.control}
          name="signature"
          render={({ field }) => (
            <Field className="flex flex-col">
              <SignaturePad
                value={field.value}
                onChange={field.onChange}
                disabled={form.formState.isSubmitting}
              />
              <FieldDescription>
                Click the pen button to open the signature pad. Draw the
                signature, then hold the confirm button to save it.
              </FieldDescription>
            </Field>
          )}
        />
      </SettingsSection>

      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-2 rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
        <Button type="button" variant="ghost" asChild>
          <Link {...backLink}>Cancel</Link>
        </Button>
        <SubmitButton
          text={isEdit ? "Save changes" : "Create user"}
          loadingText="Saving…"
          isSubmitting={form.formState.isSubmitting}
        />
      </div>
    </form>
  )
}
