import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import {
  AvatarField,
  EmailField,
  PasswordField,
  TelephoneField,
  TextField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import {
  DriverCreateSchema,
  DriverCreateSchemaType,
  DriverUpdateSchema,
  DriverUpdateSchemaType,
} from "@/features/drivers/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { SubmitButton } from "@/components/ui/submit-button"
import { BaseFormProps } from "@/common/types"

type DriverFormProps = BaseFormProps<
  DriverCreateSchemaType,
  DriverUpdateSchemaType
>

export function DriverForm({ mode, defaultValues, onSubmit }: DriverFormProps) {
  const tr = useTranslation()
  const isEdit = !!defaultValues

  const formSchema = isEdit ? DriverUpdateSchema : DriverCreateSchema

  type Values = z.infer<typeof formSchema>

  const form = useForm<Values>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  })

  async function handleSubmit(values: Values) {
    if (mode === "edit") {
      onSubmit(DriverUpdateSchema.parse(values))
    } else {
      onSubmit(DriverCreateSchema.parse(values))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Driver details" : "New Driver"}</CardTitle>
        <CardDescription>Create new driver</CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          console.log(errors)
        })}
      >
        <CardContent className="pb-6">
          <FieldGroup>
            <AvatarField control={form.control} name={"avatar"} nameField={"first_name"}/>
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
