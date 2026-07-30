import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup } from "@/components/ui/field"
import {
  EmailField,
  TextField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import {
  CustomerCreateSchema,
  CustomerUpdateSchema,
} from "@/features/clients/schemas"
import { createClientFn, updateClientFn } from "@/features/clients/services"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { UserPickerField } from "@/features/users/components/user-picker"

type ClientFormProps = {
  initialData?: z.infer<typeof CustomerUpdateSchema>
}

export function ClientForm({ initialData }: ClientFormProps) {
  const tr = useTranslation()
  const queryInvalidator = useQueryInvalidator()

  const isEdit = !!initialData

  const formSchema = isEdit ? CustomerUpdateSchema : CustomerCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const promise =
      "id" in values
        ? updateClientFn({ data: values })
        : createClientFn({ data: values })

    const { isSuccess, error, message } = await promise
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.clients.list.invalidate()
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Client details" : "New Client"}</CardTitle>
        <CardDescription>Create new client</CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
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
              <TextField
                label={tr("common.form.phone")}
                name={"phone"}
                control={form.control}
                required={false}
              />
            </Field>
            <TextField
              label={"Tin Number"}
              name={"tin_number"}
              control={form.control}
              required={false}
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
