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
  NumberField,
  SelectField,
  TextField,
} from "@/components/ui/form-fields"
import { useTranslation } from "@/i18n"
import {
  EditSettingsSchema,
  EditSettingsSchemaType,
} from "@/features/settings/schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { SubmitButton } from "@/components/ui/submit-button"
import { DATE_FORMATS_OPTIONS, MONTH_OPTIONS } from "@/common/constants"
import { Can } from "@/components/has-permission"
import { useEditSettings } from "../hooks/use-settings"

type EditSettingsFormProps = {
  settings?: EditSettingsSchemaType
}

export function EditSettingsForm({ settings }: EditSettingsFormProps) {
  const tr = useTranslation()
  const { mutate: updateSettings } = useEditSettings()

  const formSchema = EditSettingsSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateSettings(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{"Edit Settings"}</CardTitle>
        <CardDescription>Change company settings</CardDescription>
      </CardHeader>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log(errors)
        })}
      >
        <CardContent className="pb-6">
          <FieldGroup>
            <NumberField
              label={"Search Radius (meters)"}
              name={"search_radius"}
              control={form.control}
            />
            <NumberField
              label={"Counter Padding"}
              name={"counter_padding"}
              control={form.control}
            />
            <SelectField
              label={"Date Format"}
              name={"date_format"}
              control={form.control}
              options={DATE_FORMATS_OPTIONS}
            />
            <SelectField
              label={"Company Start Month"}
              name={"fiscal_year_start_month"}
              control={form.control}
              options={MONTH_OPTIONS}
            />
            <TextField
              label={"Currency Code"}
              name={"currency_code"}
              control={form.control}
            />
          </FieldGroup>
        </CardContent>
        <Can permission="config:edit">
          <CardFooter className="justify-end">
            <SubmitButton
              text={tr("common.form.submit")}
              isSubmitting={form.formState.isSubmitting}
            />
          </CardFooter>
        </Can>
      </form>
    </Card>
  )
}
