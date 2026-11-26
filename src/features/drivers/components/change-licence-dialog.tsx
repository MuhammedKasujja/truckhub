import { useEffect, useId, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format, parseISO } from "date-fns"
import { CircleAlert, Loader2 } from "lucide-react"
import { useChangeDriverLicense } from "../hooks/user-driver"
import {
  LICENSE_NOTES_MAX,
  buildLicenseChangeSchema,
  todayDateInput,
  uncoveredVehicleTypes,
} from "../schemas"
import { LICENSE_CHANGE_REASONS } from "../enums"
import { labelFor } from "./driver-options"
import { DocumentFilePicker, LicenceCategoryPicker } from "./licence-fields"
import type { LicenseChangeFormValues } from "../schemas"
import type { LicenseChangeReason } from "../enums"
import type { Driver } from "../types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { DatePicker } from "@/components/ui/form-fields"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/format"

type Props = {
  driver: Driver
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const LICENSE_REASON_LABELS: Record<LicenseChangeReason, string> = {
  initial: "Registered",
  renewal: "Renewal",
  replacement: "Replacement (lost, damaged or reissued)",
  category_change: "Category change",
  correction: "Correction of a mistake",
}

const EARLIEST_DATE = new Date(2000, 0)
const LATEST_EXPIRY = new Date(new Date().getFullYear() + 15, 11)

const toDate = (v: string | undefined) => (v ? parseISO(v) : undefined)
const toInput = (d: Date | undefined) => (d ? format(d, "yyyy-MM-dd") : "")

/** Replace the driver's current licence; the old one is kept as history. */
export function ChangeLicenceDialog({ driver, open, onOpenChange }: Props) {
  const id = useId()
  const { license } = driver
  const needed = useMemo(
    () => [...new Set(driver.vehicle_types.map((v) => v.vehicle_type))],
    [driver.vehicle_types]
  )
  const schema = useMemo(() => buildLicenseChangeSchema(needed), [needed])
  const { mutateAsync, isPending } = useChangeDriverLicense()

  const defaults = (): LicenseChangeFormValues => ({
    licenseNumber: license.license_number,
    licenseClasses: [...license.license_classes],
    expiryDate: "",
    effectiveFrom: "",
    reason: "renewal",
    notes: "",
    licenseCopy: undefined as unknown as File,
  })

  const form = useForm<LicenseChangeFormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: defaults(),
  })
  const { control } = form

  // Start from the current licence each time the dialog opens
  useEffect(() => {
    if (open) form.reset(defaults())
  }, [open])

  const classes = useWatch({ control, name: "licenseClasses" })
  const gaps = uncoveredVehicleTypes(needed, classes)
  const today = new Date()

  async function onSubmit(values: LicenseChangeFormValues) {
    const data = schema.parse(values)
    try {
      await mutateAsync({
        id: driver.id,
        license_number: data.licenseNumber,
        license_classes: data.licenseClasses,
        expiry_date: data.expiryDate,
        effective_from: data.effectiveFrom || undefined,
        reason: data.reason,
        notes: data.notes || undefined,
        license_copy: data.licenseCopy,
      })
      onOpenChange(false)
    } catch {
      // The hook has already shown the API's message
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isPending) onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <form
          onSubmit={(e) => {
            e.stopPropagation()
            void form.handleSubmit(onSubmit)(e)
          }}
          className="space-y-5"
        >
          <DialogHeader>
            <DialogTitle>Change licence</DialogTitle>
            <DialogDescription>
              The current licence ({license.license_number}, valid until{" "}
              {formatDate(license.expiry_date)}) is kept in the history with
              its copy.
            </DialogDescription>
          </DialogHeader>

          <Controller
            control={control}
            name="reason"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-reason`}>Reason</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={`${id}-reason`} className="w-full">
                    <SelectValue placeholder="Choose a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {LICENSE_CHANGE_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {LICENSE_REASON_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Controller
              control={control}
              name="licenseNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${id}-number`}>
                    Licence number
                  </FieldLabel>
                  <Input
                    id={`${id}-number`}
                    {...field}
                    className="font-mono uppercase"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              control={control}
              name="expiryDate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${id}-expiry`}>Expiry date</FieldLabel>
                  <DatePicker
                    id={`${id}-expiry`}
                    format="P"
                    value={toDate(field.value)}
                    startDate={today}
                    endDate={LATEST_EXPIRY}
                    minDate={today}
                    placeholder="Pick a date"
                    aria-invalid={fieldState.invalid}
                    onDateChanged={(d) => {
                      field.onChange(toInput(d))
                      field.onBlur()
                    }}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            control={control}
            name="licenseClasses"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <LicenceCategoryPicker
                  value={field.value}
                  onChange={(next) => {
                    field.onChange(next)
                    field.onBlur()
                  }}
                  needed={needed}
                  labelledBy={`${id}-classes`}
                  labelSlot={
                    <FieldLabel id={`${id}-classes`}>
                      Licence categories
                    </FieldLabel>
                  }
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {gaps.length > 0 && (
            <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              <span>
                This licence doesn't cover{" "}
                {gaps.map((t) => labelFor("vehicleType", t)).join(", ")}, which
                the driver is down for. You can still save it with a note, and
                the driver will be flagged.
              </span>
            </p>
          )}

          <Controller
            control={control}
            name="effectiveFrom"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-effective`}>
                  Effective from (optional)
                </FieldLabel>
                <DatePicker
                  id={`${id}-effective`}
                  format="P"
                  value={toDate(field.value)}
                  startDate={EARLIEST_DATE}
                  endDate={today}
                  placeholder={`Today (${formatDate(todayDateInput())})`}
                  onDateChanged={(d) => field.onChange(toInput(d))}
                />
                <FieldDescription>
                  When the new licence took effect. Leave empty for today.
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-notes`}>
                  Notes {gaps.length > 0 ? "(required)" : "(optional)"}
                </FieldLabel>
                <Textarea
                  id={`${id}-notes`}
                  {...field}
                  value={field.value ?? ""}
                  maxLength={LICENSE_NOTES_MAX}
                  placeholder={
                    gaps.length > 0
                      ? "e.g. Truck category to be added after the test in March"
                      : "e.g. Renewed after the old licence expired"
                  }
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="licenseCopy"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${id}-copy`}>
                  Photocopy of the new licence
                </FieldLabel>
                <DocumentFilePicker
                  id={`${id}-copy`}
                  name={field.name}
                  ref={field.ref}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Change licence
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
