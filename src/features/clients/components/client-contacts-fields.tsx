import { useFieldArray, useWatch } from "react-hook-form"
import type { ClientContactInput } from "../schemas"
import type { UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import {
  EmailField,
  TelephoneField,
  TextField,
} from "@/components/ui/form-fields"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ActionIcon } from "@/components/icons"
import { useTranslation } from "@/i18n"

export type ClientContactsFormValues = { contacts: ClientContactInput[] }

type ClientContactsFieldsProps = {
  form: UseFormReturn<ClientContactsFormValues>
}

export function ClientContactsFields({ form }: ClientContactsFieldsProps) {
  const tr = useTranslation()
  const { control, formState, getValues, setValue, trigger } = form

  // RHF replaces `id` with its own key by default, which would lose the
  // server contact id
  const { fields, append, remove } = useFieldArray({
    control,
    name: "contacts",
    keyName: "fieldKey",
  })

  const contacts = useWatch({ control, name: "contacts" })
  const primaryIndex = contacts.findIndex((contact) => contact.is_primary)

  function revalidateAfterSubmit() {
    if (formState.isSubmitted) void trigger("contacts")
  }

  function setPrimary(index: number) {
    getValues("contacts").forEach((_, i) => {
      setValue(`contacts.${i}.is_primary`, i === index, { shouldDirty: true })
    })
    revalidateAfterSubmit()
  }

  function removeContact(index: number) {
    if (fields.length <= 1) return
    if (getValues(`contacts.${index}.is_primary`)) {
      setPrimary(index === 0 ? 1 : 0)
    }
    remove(index)
    revalidateAfterSubmit()
  }

  const listError =
    formState.errors.contacts?.root?.message ??
    formState.errors.contacts?.message

  return (
    <div className="flex flex-col gap-4">
      <RadioGroup
        className="gap-6"
        value={primaryIndex >= 0 ? String(primaryIndex) : ""}
        onValueChange={(value) => setPrimary(Number(value))}
      >
        {fields.map((field, index) => (
          <div key={field.fieldKey} className="flex flex-col gap-3">
            <TextField
              label={tr("common.form.name")}
              name={`contacts.${index}.name`}
              control={control}
            />
            <TelephoneField
              label={tr("common.form.phone")}
              name={`contacts.${index}.phone`}
              control={control}
            />
            <EmailField
              required={false}
              label={tr("common.form.email")}
              name={`contacts.${index}.email`}
              control={control}
              placeholder="user@mail.com"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem
                  id={`contact-primary-${field.fieldKey}`}
                  value={String(index)}
                />
                <Label htmlFor={`contact-primary-${field.fieldKey}`}>
                  {tr("clients.primary_contact")}
                </Label>
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant={"destructive"}
                  size={"icon-sm"}
                  aria-label={tr("clients.remove_contact")}
                  onClick={() => removeContact(index)}
                >
                  <ActionIcon action="delete" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
      {listError && <FieldError>{listError}</FieldError>}
      <Button
        type="button"
        variant={"outline"}
        onClick={() =>
          append({
            name: "",
            phone: "",
            email: "",
            is_primary: fields.length === 0,
          })
        }
      >
        {tr("clients.add_contact")}
      </Button>
    </div>
  )
}
