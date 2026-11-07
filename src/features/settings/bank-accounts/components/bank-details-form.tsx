import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Landmark } from "lucide-react"
import { bankCountryCodes } from "../enums"
import { bankCountryMeta } from "../labels"
import type z from "zod"
import type {
  BankDetailsUpdateInput} from "@/features/settings/bank-accounts/schemas";
import { TextField } from "@/components/ui/form-fields"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import {
  bankDetailsCreateSchema,
  bankDetailsUpdateSchema
} from "@/features/settings/bank-accounts/schemas"
import {
  createBankFn,
  updateBankFn,
} from "@/features/settings/bank-accounts/services"
import {
  FormGroup,
  OptionTile,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"

type BankDetailsFormProps = {
  initialData?: BankDetailsUpdateInput
  open: boolean
  onOpenChange: (v: boolean) => void
}

const createDefaults = { name: "", country: "UG", swift_code: "" } as const

export function BankDetailsForm({
  initialData,
  open,
  onOpenChange,
}: BankDetailsFormProps) {
  const queryInvalidator = useQueryInvalidator()
  const isEdit = !!initialData

  const formSchema = isEdit ? bankDetailsUpdateSchema : bankDetailsCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? createDefaults,
  })

  useEffect(() => {
    if (open) form.reset(initialData ?? createDefaults)
  }, [open])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const data = {
      ...values,
      swift_code: values.swift_code?.trim().toUpperCase() || undefined,
    }
    const { isSuccess, error, message } =
      "id" in data
        ? await updateBankFn({ data })
        : await createBankFn({ data })

    if (isSuccess) {
      toast.success(message)
      queryInvalidator.banks.list.invalidate()
      // Accounts embed their bank, so refresh them too.
      queryInvalidator.bankAccounts.list.invalidate()
      onOpenChange(false)
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Landmark}
      eyebrow={isEdit ? "Edit bank" : "New bank"}
      title={isEdit ? (initialData.name ?? "Bank") : "Add a bank"}
      description="Banks you add can be picked when creating bank accounts."
      size="sm"
      submitText={isEdit ? "Save changes" : "Add bank"}
      isSubmitting={form.formState.isSubmitting}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormGroup title="Bank">
        <TextField
          label="Bank name"
          control={form.control}
          name="name"
          placeholder="e.g. Stanbic Bank"
        />
        <TextField
          label="SWIFT / BIC code"
          control={form.control}
          name="swift_code"
          placeholder="e.g. SBICUGKX"
          description="Needed for international transfers."
          required={false}
        />
      </FormGroup>

      <FormGroup title="Country">
        <Controller
          control={form.control}
          name="country"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <div
                role="radiogroup"
                aria-label="Country"
                className="grid grid-cols-2 gap-2"
              >
                {bankCountryCodes.map((code) => (
                  <OptionTile
                    key={code}
                    selected={field.value === code}
                    onSelect={() => field.onChange(code)}
                    title={bankCountryMeta[code].label}
                    description={code}
                  />
                ))}
              </div>
              {fieldState.error && (
                <p className="text-xs text-destructive">Choose a country</p>
              )}
            </div>
          )}
        />
      </FormGroup>
    </SettingsFormDialog>
  )
}
