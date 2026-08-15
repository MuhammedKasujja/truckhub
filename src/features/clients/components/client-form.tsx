import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import { EmailField, TelephoneField, TextField, TinNumberField } from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import {
  ClientCreateInput,
  ClientCreateSchema,
  ClientUpdateInput,
  ClientUpdateSchema,
} from "@/features/clients/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { SubmitButton } from "@/components/ui/submit-button"
import { UserPickerField } from "@/features/users/components/user-picker"
import { BaseFormProps } from "@/common/types"

type ClientFormProps = BaseFormProps<ClientCreateInput, ClientUpdateInput>

export function ClientForm({ mode, defaultValues, onSubmit }: ClientFormProps) {
  const tr = useTranslation()

  const isEdit = mode === "edit"

  const formSchema = isEdit ? ClientUpdateSchema : ClientCreateSchema

  type Values = z.infer<typeof formSchema>

  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  })

  async function handleSubmit(values: Values) {
    if (mode === "edit") {
      onSubmit(ClientUpdateSchema.parse(values))
    } else {
      onSubmit(ClientCreateSchema.parse(values))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Client details" : "New Client"}</CardTitle>
        <CardDescription>Create new client</CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          console.log(errors)
        })}
      >
        <CardContent className="pb-6">
          <FieldGroup>
            <Field orientation={"horizontal"} className="gap-4">
              <TextField
                label={tr("common.form.name")}
                name={"name"}
                control={form.control}
              />
              <TextField
                required={false}
                label={tr("common.form.short_name")}
                name={"short_name"}
                control={form.control}
              />
            </Field>
            <Field orientation={"horizontal"} className="gap-4">
              <TelephoneField
                label={tr("common.form.phone")}
                name={"phone"}
                control={form.control}
              />
            </Field>
            <TinNumberField
              label={"Tin Number"}
              name={"tin_number"}
              control={form.control}
            />
            <TextField
              label={"Address"}
              name={"address"}
              control={form.control}
              required={false}
            />
            <EmailField
              label={tr("common.form.email")}
              name={"email"}
              control={form.control}
              placeholder="user@mail.com"
            />
            <UserPickerField
              label={tr("common.form.assigned")}
              control={form.control}
              name={"asssigned_user_id"}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <SubmitButton
            text={tr("common.form.submit")}
            isSubmitting={form.formState.isSubmitting}
          />
        </CardFooter>
      </form>
    </Card>
  )
}
