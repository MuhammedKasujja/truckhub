import { describe, expect, it } from "vitest"
import {
  LeaveRequestCreateSchema,
  PayComponentCreateSchema,
  PayslipLineCreateSchema,
  StaffCreateSchema,
  StaffSearchSchema,
  TaxBandsReplaceSchema,
} from "@/features/hr/schemas"
import {
  formatComponentValue,
  formatDays,
  formatPeriod,
} from "@/features/hr/labels"
import {
  splitFullName,
  staffValuesFromDriver,
  staffValuesFromUser,
} from "@/features/hr/staff-source"
import { HrModulePermissions } from "@/features/auth/permissions/hr_permissions"
import { checkUserPermission } from "@/lib/permissions"

const staff = {
  first_name: "Amina",
  last_name: "Nakato",
  employment_type: "full_time",
  payment_method: "bank",
  hire_date: "2026-01-15",
}

describe("StaffCreateSchema", () => {
  it("needs only a name, employment type, payment method and hire date", () => {
    expect(StaffCreateSchema.safeParse(staff).success).toBe(true)
  })

  it("accepts blank optional fields, which are sent as null", () => {
    const result = StaffCreateSchema.safeParse({
      ...staff,
      email: "",
      phone: "",
      basic_salary: "",
    })
    expect(result.success).toBe(true)
  })

  it("rejects a bad email, salary or hire date", () => {
    expect(StaffCreateSchema.safeParse({ ...staff, email: "nope" }).success).toBe(false)
    expect(StaffCreateSchema.safeParse({ ...staff, basic_salary: "1,000" }).success).toBe(false)
    expect(StaffCreateSchema.safeParse({ ...staff, hire_date: "15/01/2026" }).success).toBe(false)
  })
})

describe("StaffSearchSchema", () => {
  it("defaults to the first page with no filters", () => {
    expect(StaffSearchSchema.parse({})).toEqual({ page: 1, perPage: 20, search: "" })
  })
})

describe("LeaveRequestCreateSchema", () => {
  const request = {
    staff_id: "staff-1",
    leave_type_id: "type-1",
    start_date: "2027-03-01",
    end_date: "2027-03-05",
  }

  it("accepts a single day", () => {
    expect(
      LeaveRequestCreateSchema.safeParse({ ...request, end_date: "2027-03-01" }).success
    ).toBe(true)
  })

  it("puts an end-before-start error on the end date", () => {
    const result = LeaveRequestCreateSchema.safeParse({
      ...request,
      end_date: "2027-02-28",
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(["end_date"])
  })
})

describe("PayComponentCreateSchema", () => {
  const component = {
    code: "housing",
    name: "Housing",
    kind: "earning",
    calc_type: "percent_of_basic",
    default_value: 10,
    is_taxable: true,
    is_pre_tax: false,
    is_statutory: false,
    applies_to_all: false,
    sort_order: 0,
  }

  it("accepts a percentage-of-basic earning", () => {
    expect(PayComponentCreateSchema.safeParse(component).success).toBe(true)
  })

  it("rejects an earning that is a share of gross pay", () => {
    const result = PayComponentCreateSchema.safeParse({
      ...component,
      calc_type: "percent_of_gross",
    })
    expect(result.error?.issues[0].path).toEqual(["calc_type"])
  })

  it("rejects a percentage above 100 but allows a large fixed amount", () => {
    expect(
      PayComponentCreateSchema.safeParse({ ...component, default_value: 150 }).success
    ).toBe(false)
    expect(
      PayComponentCreateSchema.safeParse({
        ...component,
        calc_type: "fixed",
        default_value: 300000,
      }).success
    ).toBe(true)
  })

  it("rejects codes the API would refuse", () => {
    expect(
      PayComponentCreateSchema.safeParse({ ...component, code: "Housing Allowance" }).success
    ).toBe(false)
  })
})

describe("TaxBandsReplaceSchema", () => {
  it("allows an open-ended last band", () => {
    const result = TaxBandsReplaceSchema.safeParse({
      bands: [
        { lower_bound: "0", upper_bound: "235000", rate_percent: 0 },
        { lower_bound: "235000", upper_bound: "", rate_percent: 10 },
      ],
    })
    expect(result.success).toBe(true)
  })
})

describe("PayslipLineCreateSchema", () => {
  const line = {
    run_id: "run-1",
    payslip_id: "slip-1",
    name: "Bonus",
    kind: "earning",
    amount: "200000",
    is_taxable: true,
  }

  it("needs an amount above zero", () => {
    expect(PayslipLineCreateSchema.safeParse(line).success).toBe(true)
    expect(PayslipLineCreateSchema.safeParse({ ...line, amount: "0" }).success).toBe(false)
  })
})

describe("labels", () => {
  it("formats periods and day counts", () => {
    expect(formatPeriod(2026, 11)).toBe("November 2026")
    expect(formatDays("1.0")).toBe("1 day")
    expect(formatDays("5.0")).toBe("5 days")
    expect(formatDays("2.5")).toBe("2.5 days")
  })

  it("describes percentages by what they are a share of", () => {
    expect(formatComponentValue({ calc_type: "percent_of_gross" }, "5.0000")).toBe(
      "5% of gross"
    )
    expect(formatComponentValue({ calc_type: "percent_of_basic" }, "20")).toBe(
      "20% of basic"
    )
  })
})

describe("permissions", () => {
  const user = {
    id: "u1",
    name: "Staff Member",
    email: "s@example.com",
    is_admin: false,
    permissions: [] as string[],
  }

  it("lets every signed-in user into self-service but not into HR", () => {
    const can = checkUserPermission(user)
    expect(can("me:view")).toBe(true)
    expect(can("hr:module")).toBe(false)
    expect(can("hr:staff:view")).toBe(false)
  })

  it("grants a named permission only with all of its API permissions", () => {
    const partly = checkUserPermission({ ...user, permissions: ["staff:read"] })
    expect(partly("hr:staff:view")).toBe(false)
    const fully = checkUserPermission({
      ...user,
      permissions: [...HrModulePermissions["hr:staff:view"]],
    })
    expect(fully("hr:staff:view")).toBe(true)
  })
})

describe("creating staff from a user or driver", () => {
  it("copies a user's details and links their login", () => {
    expect(
      staffValuesFromUser({
        id: "user-1",
        first_name: "Joan",
        last_name: "Auma",
        email: "joan@example.com",
        phone: undefined,
      })
    ).toEqual({
      first_name: "Joan",
      last_name: "Auma",
      email: "joan@example.com",
      phone: "",
      user_id: "user-1",
    })
  })

  it("splits a driver's single name field", () => {
    expect(splitFullName("Musa Kato")).toEqual({ first_name: "Musa", last_name: "Kato" })
    expect(splitFullName("  Mary  Jane   Nakato ")).toEqual({
      first_name: "Mary",
      last_name: "Jane Nakato",
    })
    expect(splitFullName("Musa")).toEqual({ first_name: "Musa", last_name: "" })
  })

  it("copies a driver's details and links the driver", () => {
    expect(
      staffValuesFromDriver({
        id: "driver-1",
        full_name: "Musa Kato",
        email: "musa@example.com",
        phone: "0700000000",
        gender: "Male",
        date_of_birth: "1990-05-17T00:00:00",
        national_id: "CM90001",
      })
    ).toEqual({
      first_name: "Musa",
      last_name: "Kato",
      email: "musa@example.com",
      phone: "0700000000",
      gender: "male",
      date_of_birth: "1990-05-17",
      national_id: "CM90001",
      driver_id: "driver-1",
    })
  })

  it("leaves an unknown gender and missing details for HR to fill in", () => {
    const values = staffValuesFromDriver({
      id: "driver-2",
      full_name: "Sam",
      email: "sam@example.com",
      gender: "other",
    })
    expect(values.gender).toBeNull()
    expect(values.date_of_birth).toBeNull()
    // a one-word name leaves the last name empty, which the form then asks for
    expect(
      StaffCreateSchema.safeParse({ ...staff, ...values }).error?.issues[0].path
    ).toEqual(["last_name"])
  })

  it("accepts the link ids on the create form", () => {
    expect(StaffCreateSchema.safeParse({ ...staff, user_id: "user-1" }).success).toBe(true)
    expect(StaffCreateSchema.safeParse({ ...staff, driver_id: "driver-1" }).success).toBe(true)
  })
})
