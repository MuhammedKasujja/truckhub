import { Link, useNavigate } from "@tanstack/react-router"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  IdCard,
  Link2,
} from "lucide-react"
import { departmentsQueryOptions } from "../query-options"
import { StaffCreateSchema, StaffUpdateSchema } from "../schemas"
import { createStaffFn, updateStaffFn } from "../services"
import { useHrAction } from "../use-hr-action"
import {
  EMPLOYMENT_TYPE_OPTIONS,
  GENDER_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from "../labels"
import { EARLIEST_DATE, OptionalSelectField } from "./hr-ui"
import type z from "zod"
import type { StaffPrefill, StaffSource } from "../staff-source"
import type { Staff } from "../types"
import { Button } from "@/components/ui/button"
import {
  DatePickerField,
  EmailField,
  MoneyField,
  SelectField,
  TextField,
} from "@/components/ui/form-fields"
import { SubmitButton } from "@/components/ui/submit-button"
import { SettingsSection } from "@/features/settings/_components/settings-ui"

type CreateValues = z.infer<typeof StaffCreateSchema>
type UpdateValues = z.infer<typeof StaffUpdateSchema>
type FormValues = CreateValues & Partial<Pick<UpdateValues, "id" | "status">>

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
]

export function toFormValues(staff?: Staff, prefill?: StaffPrefill): FormValues {
  if (!staff) {
    return {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      employment_type: "full_time",
      payment_method: "bank",
      hire_date: new Date().toLocaleDateString("en-CA"),
      basic_salary: "",
      ...prefill,
    }
  }
  return {
    id: staff.id,
    first_name: staff.first_name,
    last_name: staff.last_name,
    email: staff.email ?? "",
    phone: staff.phone ?? "",
    gender: staff.gender,
    date_of_birth: staff.date_of_birth,
    national_id: staff.national_id ?? "",
    tin: staff.tin ?? "",
    nssf_number: staff.nssf_number ?? "",
    department_id: staff.department_id,
    job_title: staff.job_title ?? "",
    employment_type: staff.employment_type,
    hire_date: staff.hire_date,
    payment_method: staff.payment_method,
    bank_name: staff.bank_name ?? "",
    bank_account_name: staff.bank_account_name ?? "",
    bank_account_number: staff.bank_account_number ?? "",
    mobile_money_number: staff.mobile_money_number ?? "",
    // A terminated member is reinstated from their page, not from this form.
    status: staff.status === "suspended" ? "suspended" : "active",
  }
}

type StaffFormProps = {
  staff?: Staff
  /** The user or driver a new staff member is being created from. */
  source?: StaffSource
  prefill?: StaffPrefill
}

export function StaffForm({ staff, source, prefill }: StaffFormProps) {
  const navigate = useNavigate()
  const isEdit = !!staff
  const { data: departments = [] } = useQuery(departmentsQueryOptions())

  const form = useForm<FormValues>({
    resolver: zodResolver(isEdit ? StaffUpdateSchema : StaffCreateSchema),
    defaultValues: toFormValues(staff, prefill),
  })
  const paymentMethod = useWatch({ control: form.control, name: "payment_method" })

  const goToStaff = (id: string) =>
    navigate({ to: "/hr/staff/$staffId/view", params: { staffId: id } })

  const create = useHrAction(
    (data: CreateValues) => createStaffFn({ data }),
    { fallbackError: "Couldn't add the staff member", onDone: (s) => s && goToStaff(s.id) }
  )
  const update = useHrAction(
    (data: UpdateValues) => updateStaffFn({ data }),
    { fallbackError: "Couldn't save the changes", onDone: (s) => s && goToStaff(s.id) }
  )

  async function onSubmit(values: FormValues) {
    if (values.id) {
      const { basic_salary: _unused, ...rest } = values
      await update.runAsync({ ...rest, id: values.id })
    } else {
      await create.runAsync(values)
    }
  }

  const backLink = staff
    ? ({ to: "/hr/staff/$staffId/view", params: { staffId: staff.id } } as const)
    : source?.kind === "user"
      ? ({
          to: "/settings/user-management/users/$userId/view",
          params: { userId: source.id },
        } as const)
      : source?.kind === "driver"
        ? ({ to: "/drivers/$driverId/view", params: { driverId: source.id } } as const)
        : ({ to: "/hr/staff" } as const)
  const backText = isEdit
    ? "Back to staff member"
    : source
      ? `Back to ${source.name}`
      : "All staff"

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="space-y-1">
        <Link
          {...backLink}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {backText}
        </Link>
        <h2 className="text-lg font-bold tracking-tight">
          {isEdit
            ? `Edit ${staff.name}`
            : source
              ? `Create a staff record for ${source.name}`
              : "Add a staff member"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update their personal, employment and payment details."
            : source
              ? "Check the details copied over, then add their employment and pay."
              : "This creates their staff record. You can give them a login afterwards."}
        </p>
      </div>

      {source && (
        <p className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <Link2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            {source.kind === "user" ? (
              <>
                This staff record will be linked to{" "}
                <span className="font-medium">{source.name}</span>'s existing
                login, so they can see their own leave and payslips straight
                away. Their login and roles don't change.
              </>
            ) : (
              <>
                This staff record will be linked to the driver{" "}
                <span className="font-medium">{source.name}</span>. Their driver
                record doesn't change.
              </>
            )}
          </span>
        </p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <SettingsSection icon={IdCard} title="Personal details">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="First name" name="first_name" control={form.control} />
            <TextField label="Last name" name="last_name" control={form.control} />
            <EmailField
              label="Email"
              name="email"
              control={form.control}
              required={false}
              description="Needed before they can be given a login"
            />
            <TextField
              label="Phone"
              name="phone"
              control={form.control}
              required={false}
            />
            <OptionalSelectField
              label="Gender"
              name="gender"
              control={form.control}
              options={GENDER_OPTIONS}
              description="Some leave types depend on it"
              noneLabel="Not set"
            />
            <DatePickerField
              label="Date of birth"
              name="date_of_birth"
              control={form.control}
              required={false}
              placeholder="Pick a date"
              startDate={EARLIEST_DATE}
              endDate={new Date()}
            />
            <TextField
              label="National ID"
              name="national_id"
              control={form.control}
              required={false}
            />
            <TextField label="TIN" name="tin" control={form.control} required={false} />
            <TextField
              label="NSSF number"
              name="nssf_number"
              control={form.control}
              required={false}
            />
          </div>
        </SettingsSection>

        <div className="flex flex-col gap-6">
          <SettingsSection icon={BriefcaseBusiness} title="Employment">
            <div className="grid gap-4 sm:grid-cols-2">
              <OptionalSelectField
                label="Department"
                name="department_id"
                control={form.control}
                options={departments.map((d) => ({ value: d.id, label: d.name }))}
                noneLabel="No department"
              />
              <TextField
                label="Job title"
                name="job_title"
                control={form.control}
                required={false}
              />
              <SelectField
                label="Employment type"
                name="employment_type"
                control={form.control}
                options={EMPLOYMENT_TYPE_OPTIONS}
              />
              <DatePickerField
                label="Hire date"
                name="hire_date"
                control={form.control}
                placeholder="Pick a date"
                startDate={EARLIEST_DATE}
              />
              {isEdit ? (
                <SelectField
                  label="Status"
                  name="status"
                  control={form.control}
                  options={STATUS_OPTIONS}
                  description="Suspended staff are left out of payroll and can't take leave"
                />
              ) : (
                <MoneyField
                  label="Basic salary (monthly)"
                  name="basic_salary"
                  control={form.control}
                  required={false}
                  description="Starts on the hire date. You can add it later."
                />
              )}
            </div>
          </SettingsSection>

          <SettingsSection icon={Banknote} title="How they are paid">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Payment method"
                name="payment_method"
                control={form.control}
                options={PAYMENT_METHOD_OPTIONS}
              />
              {paymentMethod === "bank" && (
                <>
                  <TextField
                    label="Bank"
                    name="bank_name"
                    control={form.control}
                    required={false}
                  />
                  <TextField
                    label="Account name"
                    name="bank_account_name"
                    control={form.control}
                    required={false}
                  />
                  <TextField
                    label="Account number"
                    name="bank_account_number"
                    control={form.control}
                    required={false}
                  />
                </>
              )}
              {paymentMethod === "mobile_money" && (
                <TextField
                  label="Mobile money number"
                  name="mobile_money_number"
                  control={form.control}
                  required={false}
                />
              )}
            </div>
          </SettingsSection>
        </div>
      </div>

      <div className="sticky bottom-4 z-10 flex items-center justify-end gap-2 rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
        <Button type="button" variant="ghost" asChild>
          <Link {...backLink}>Cancel</Link>
        </Button>
        <SubmitButton
          text={isEdit ? "Save changes" : "Add staff member"}
          loadingText="Saving…"
          isSubmitting={form.formState.isSubmitting}
        />
      </div>
    </form>
  )
}
