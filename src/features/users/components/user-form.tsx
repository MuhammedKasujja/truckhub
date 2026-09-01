import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  EmailField,
  PasswordField,
  TelephoneField,
  TextField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import {
  UserCreateSchema,
  UserUpdateSchema,
  UserUpdateSchemaType,
} from "@/features/users/schemas"
import { createUserFn, updateUserFn } from "@/features/users/services"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import SignaturePad from "@/components/ui/signature-pad"

type UserFormProps = {
  initialData?: Partial<UserUpdateSchemaType>
}

export function UserForm({ initialData }: UserFormProps) {
  const queryInvalidator = useQueryInvalidator()
  const isEdit = !!initialData

  const formSchema = isEdit ? UserUpdateSchema : UserCreateSchema

  const tr = useTranslation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...initialData, phone: initialData?.phone ?? "" },
  })

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values
        ? updateUserFn({ data: values })
        : createUserFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.users.list.invalidate()
    } else {
      toast.error(error!.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? tr("edit_user") : tr("new_user")}</CardTitle>
        <CardDescription>{tr("create_user_help")}</CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          console.log(errors)
        })}
      >
        <CardContent className="pb-6">
          <FieldGroup>
            <TextField
              label={tr("common.form.first_name")}
              name={"first_name"}
              control={form.control}
            />
            <TextField
              label={tr("common.form.last_name")}
              name={"last_name"}
              control={form.control}
            />
            <TelephoneField
              label={tr("common.form.phone")}
              name={"phone"}
              control={form.control}
              required={true}
            />
            <TextField
              label={tr("common.form.username")}
              name={"username"}
              control={form.control}
              required={false}
            />
            <EmailField
              label={tr("common.form.email")}
              name={"email"}
              control={form.control}
              placeholder="user@mail.com"
            />
            {!isEdit && (
              <PasswordField
                label={tr("common.form.password")}
                name={"password"}
                control={form.control}
              />
            )}
            <Controller
              control={form.control}
              name="signature"
              render={({ field }) => (
                <Field className="flex flex-col">
                  <FieldLabel>User Signature</FieldLabel>
                  <SignaturePad
                    value={field.value}
                    onChange={field.onChange}
                    disabled={form.formState.isSubmitting}
                  />
                  <FieldDescription>
                    Click the pen button to open the signature pad. Draw your
                    signature, then hold the confirm button to save.
                  </FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className="sm:justify-end">
          <SubmitButton
            text={tr("common.form.submit")}
            isSubmitting={form.formState.isSubmitting}
          />
        </CardFooter>
      </form>
    </Card>
  )
}
