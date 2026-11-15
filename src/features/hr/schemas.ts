import z from "zod"
import { IDSchema } from "@/schemas"

/*
 * Form schemas change no types, so a form's values and the validated values
 * are the same shape. Blank optional inputs are sent to the API as null by
 * `blankToNull` in services/server.ts.
 */
const optionalText = z.string().trim().nullish()

const optionalId = z.string().nullish()

const DateSchema = z
  .string("Required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date")

const optionalDate = z.string().nullish()

const AmountSchema = z
  .string("Required")
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount")

const optionalAmount = z
  .string()
  .trim()
  .regex(/^(\d+(\.\d{1,4})?)?$/, "Enter a valid number")
  .nullish()

const DaysSchema = z
  .number("Required")
  .min(0, "Cannot be negative")
  .max(366, "Too many days")

/* ------------------------------ Departments ------------------------------- */

export const DepartmentCreateSchema = z.object({
  name: z.string().trim().min(1, "Required").max(120),
  code: optionalText,
  description: optionalText,
  parent_id: optionalId,
  head_staff_id: optionalId,
})

export const DepartmentUpdateSchema = DepartmentCreateSchema.extend({
  id: IDSchema,
  is_active: z.boolean().optional(),
})


/* --------------------------------- Staff ---------------------------------- */

export const StaffFormSchema = z.object({
  first_name: z.string().trim().min(1, "Required").max(40),
  last_name: z.string().trim().min(1, "Required").max(40),
  email: z.union([z.email("Enter a valid email"), z.literal("")]).nullish(),
  phone: optionalText,
  gender: z.enum(["male", "female"]).optional().nullable(),
  date_of_birth: optionalDate,
  national_id: optionalText,
  tin: optionalText,
  nssf_number: optionalText,
  department_id: optionalId,
  job_title: optionalText,
  employment_type: z.enum(["full_time", "part_time", "contract", "casual"]),
  hire_date: DateSchema,
  payment_method: z.enum(["bank", "mobile_money", "cash"]),
  bank_name: optionalText,
  bank_account_name: optionalText,
  bank_account_number: optionalText,
  mobile_money_number: optionalText,
})

export const StaffCreateSchema = StaffFormSchema.extend({
  basic_salary: optionalAmount,
})

export const StaffUpdateSchema = StaffFormSchema.extend({
  id: IDSchema,
  status: z.enum(["active", "suspended"]).optional(),
})


export const StaffSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(10).max(100).default(20),
  search: z.string().default(""),
  status: z.enum(["active", "suspended", "terminated"]).optional(),
  department_id: z.string().optional(),
  has_system_access: z.boolean().optional(),
})

export type StaffSearch = z.infer<typeof StaffSearchSchema>

export const StaffTerminateSchema = z.object({
  id: IDSchema,
  termination_date: DateSchema,
  reason: optionalText,
})

export const SystemAccessGrantSchema = z.object({
  id: IDSchema,
  user_id: optionalId,
  password: z.string().nullish(),
  username: optionalText,
  role_ids: z.array(IDSchema),
})


export const CompensationSetSchema = z.object({
  id: IDSchema,
  basic_salary: AmountSchema,
  effective_from: DateSchema,
  notes: optionalText,
})

export const StaffComponentsSetSchema = z.object({
  id: IDSchema,
  components: z.array(
    z.object({ component_id: IDSchema, value: optionalAmount })
  ),
})

/* --------------------------------- Leave ---------------------------------- */

export const LeaveTypeCreateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Required")
    .max(40)
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and _ only"),
  name: z.string().trim().min(1, "Required").max(120),
  days_per_year: DaysSchema,
  is_paid: z.boolean(),
  carry_forward_max: DaysSchema,
  applies_to_gender: z.enum(["male", "female"]).optional().nullable(),
})

export const LeaveTypeUpdateSchema = LeaveTypeCreateSchema.omit({
  code: true,
  is_paid: true,
}).extend({ id: IDSchema, is_active: z.boolean() })

export const PublicHolidayCreateSchema = z.object({
  holiday_date: DateSchema,
  name: z.string().trim().min(1, "Required").max(120),
})

const leaveDates = {
  leave_type_id: IDSchema,
  start_date: DateSchema,
  end_date: DateSchema,
  reason: optionalText,
}

const endNotBeforeStart = (value: { start_date: string; end_date: string }) =>
  value.end_date >= value.start_date

const endNotBeforeStartMessage = {
  message: "The end date is before the start date",
  path: ["end_date"],
}

/** A staff member asking for their own leave. */
export const MyLeaveRequestSchema = z
  .object(leaveDates)
  .refine(endNotBeforeStart, endNotBeforeStartMessage)

/** HR filing leave for someone. */
export const LeaveRequestCreateSchema = z
  .object({ staff_id: IDSchema, ...leaveDates })
  .refine(endNotBeforeStart, endNotBeforeStartMessage)

export const LeaveDecisionSchema = z.object({
  id: IDSchema,
  note: optionalText,
})

export const LeaveRequestSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(10).max(100).default(20),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  staff_id: z.string().optional(),
})

export type LeaveRequestSearch = z.infer<typeof LeaveRequestSearchSchema>

export const LeaveBalanceQuerySchema = z.object({
  staff_id: IDSchema,
  year: z.number().int().optional(),
})

export const LeaveBalanceAdjustSchema = z.object({
  staff_id: IDSchema,
  leave_type_id: IDSchema,
  year: z.number().int().min(2000).max(2100),
  entitled: DaysSchema,
  carried_forward: DaysSchema,
  adjusted: z.number("Required").min(-366).max(366),
})

/* -------------------------------- Payroll --------------------------------- */

export const PayComponentCreateSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Required")
      .max(40)
      .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and _ only"),
    name: z.string().trim().min(1, "Required").max(120),
    kind: z.enum(["earning", "deduction", "employer_contribution"]),
    calc_type: z.enum(["fixed", "percent_of_basic", "percent_of_gross"]),
    default_value: z.number("Required").min(0, "Cannot be negative"),
    is_taxable: z.boolean(),
    is_pre_tax: z.boolean(),
    is_statutory: z.boolean(),
    applies_to_all: z.boolean(),
    sort_order: z.number().int(),
  })
  .refine((v) => !(v.kind === "earning" && v.calc_type === "percent_of_gross"), {
    message: "An earning can't be a percentage of gross pay; use basic pay",
    path: ["calc_type"],
  })
  .refine((v) => v.calc_type === "fixed" || v.default_value <= 100, {
    message: "A percentage can't be more than 100",
    path: ["default_value"],
  })

export const PayComponentUpdateSchema = z.object({
  id: IDSchema,
  name: z.string().trim().min(1, "Required").max(120),
  calc_type: z.enum(["fixed", "percent_of_basic", "percent_of_gross"]),
  default_value: z.number("Required").min(0, "Cannot be negative"),
  is_taxable: z.boolean(),
  is_pre_tax: z.boolean(),
  is_statutory: z.boolean(),
  applies_to_all: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.number().int(),
})

export const TaxBandsReplaceSchema = z.object({
  bands: z.array(
    z.object({
      lower_bound: AmountSchema,
      upper_bound: optionalAmount,
      rate_percent: z.number("Required").min(0).max(100),
    })
  ),
})

export const PayrollRunCreateSchema = z.object({
  period_year: z.number("Required").int().min(2000).max(2100),
  period_month: z.number("Required").int().min(1).max(12),
  notes: optionalText,
})

export const PayrollRunSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(10).max(100).default(20),
  status: z.enum(["draft", "approved", "paid", "cancelled"]).optional(),
})

export type PayrollRunSearch = z.infer<typeof PayrollRunSearchSchema>

export const PayrollRunPaySchema = z.object({
  id: IDSchema,
  paid_on: optionalDate,
})

export const PayslipLineCreateSchema = z.object({
  run_id: IDSchema,
  payslip_id: IDSchema,
  name: z.string().trim().min(1, "Required").max(120),
  kind: z.enum(["earning", "deduction"]),
  amount: AmountSchema.refine((value) => Number(value) > 0, "Must be above 0"),
  is_taxable: z.boolean(),
})

export const PayslipLineRemoveSchema = z.object({
  run_id: IDSchema,
  payslip_id: IDSchema,
  line_id: IDSchema,
})
