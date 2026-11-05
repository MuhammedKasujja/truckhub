import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  EmailField,
  TelephoneField,
  TextField,
  TinNumberField,
} from "@/components/ui/form-fields"
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
    <div className="grid grid-cols-5 gap-5">
      <Card className="col-span-3">
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
              <Field orientation={"horizontal"} className="w-full">
                <TextField
                  label={"City"}
                  name={"city"}
                  control={form.control}
                  required={false}
                />
                <TextField
                  label={"Country"}
                  name={"country"}
                  control={form.control}
                  required={false}
                />
              </Field>
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
      <div className="col-span-2 flex flex-col gap-5 gap-5">
        <Card className="col-span-2">
          <CardHeader>Contacts</CardHeader>
          <CardContent></CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>Address</CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
    </div>
  )
}
