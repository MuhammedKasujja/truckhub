import React from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Percent } from "lucide-react"
import type z from "zod"
import type {
  TaxRateUpdateSchemaType} from "@/features/settings/tax-rates/schemas";
import { Button } from "@/components/ui/button"
import { ActionIcon } from "@/components/icons"
import {
  NumberField,
  TextField,
  TextareaField,
} from "@/components/ui/form-fields"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { formatMoney } from "@/lib/format"
import {
  TaxRateCreateSchema,
  TaxRateUpdateSchema
} from "@/features/settings/tax-rates/schemas"
import {
  createTaxRateFn,
  updateTaxRateFn,
} from "@/features/settings/tax-rates/services"
import {
  FormGroup,
  SettingsFormDialog,
} from "@/features/settings/_components/settings-ui"

type Props = {
  trigger?: React.ReactNode
  initialData?: TaxRateUpdateSchemaType
  /** Control the dialog from outside instead of through `trigger`. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const SAMPLE_AMOUNT = 1_000_000

const emptyValues = { name: "", description: "" }

export function TaxRateForm({
  trigger,
  initialData,
  open: openProp,
  onOpenChange,
}: Props) {
  const queryInvalidator = useQueryInvalidator()
  const [openState, setOpenState] = React.useState(false)
  const open = openProp ?? openState
  const setOpen = onOpenChange ?? setOpenState

  const isEdit = !!initialData
  const formSchema = isEdit ? TaxRateUpdateSchema : TaxRateCreateSchema

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ?? emptyValues,
  })

  const rate = Number(useWatch({ control: form.control, name: "rate" }) ?? 0)
  const validRate = Number.isFinite(rate) && rate >= 0
  const tax = validRate ? (SAMPLE_AMOUNT * rate) / 100 : 0

  function handleOpenChange(next: boolean) {
    if (next) form.reset(initialData ?? emptyValues)
    setOpen(next)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { isSuccess, error, message } =
      "id" in values
        ? await updateTaxRateFn({ data: values })
        : await createTaxRateFn({ data: values })

    if (isSuccess) {
      toast.success(message)
      queryInvalidator.settings.taxRates.list()
      setOpen(false)
    } else {
      toast.error(error?.message)
    }
  }

  return (
    <SettingsFormDialog
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        openProp === undefined
          ? (trigger ?? (
              <Button size="sm">
                <ActionIcon action="create" />
                Add tax rate
              </Button>
            ))
          : undefined
      }
      icon={Percent}
      eyebrow={isEdit ? "Edit tax rate" : "New tax rate"}
      title={isEdit ? (initialData.name ?? "Tax rate") : "Add a tax rate"}
      description="Tax rates can be applied to invoice and quotation items."
      size="sm"
      submitText={isEdit ? "Save changes" : "Add tax rate"}
      isSubmitting={form.formState.isSubmitting}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FormGroup title="Details">
        <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
          <TextField
            label="Name"
            control={form.control}
            name="name"
            placeholder="e.g. VAT"
          />
          <NumberField
            label="Rate (%)"
            control={form.control}
            name="rate"
            placeholder="18"
          />
        </div>
        <TextareaField
          label="Description"
          control={form.control}
          name="description"
          placeholder="When this rate applies"
          required={false}
        />
      </FormGroup>

      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">
            Tax on {formatMoney(SAMPLE_AMOUNT)}
          </p>
          <p className="text-lg font-bold tracking-tight tabular-nums">
            {formatMoney(tax)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-sm font-semibold tabular-nums">
            {formatMoney(SAMPLE_AMOUNT + tax)}
          </p>
        </div>
      </div>
    </SettingsFormDialog>
  )
}
