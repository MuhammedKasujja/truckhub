"use client"
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
import { updateSettingsFn } from "@/features/settings/service"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import { SubmitButton } from "@/components/ui/submit-button"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { DATE_FORMATS } from "@/common/constants"

type EditSettingsFormProps = {
  settings?: EditSettingsSchemaType
}

export function EditSettingsForm({ settings }: EditSettingsFormProps) {
  const tr = useTranslation()
  const queryInvalidator = useQueryInvalidator()

  const formSchema = EditSettingsSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { isSuccess, error, message } = await updateSettingsFn({
      data: values,
    })
    if (isSuccess) {
      toast.success(message)
      queryInvalidator.settings.refresh()
    } else {
      toast.error(error?.message)
    }
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
              options={DATE_FORMATS.map((f) => ({ label: f, value: f }))}
            />
            <TextField
              label={"Currency Code"}
              name={"currency_code"}
              control={form.control}
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
