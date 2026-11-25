import z from "zod"
import { createServerFn } from "@tanstack/react-start"
import {
  StaffCreateSchema,
  StaffSearchSchema,
  StaffUpdateSchema,
  LeaveDecisionSchema,
  PayrollRunPaySchema,
  MyLeaveRequestSchema,
  StaffTerminateSchema,
  CompensationSetSchema,
  LeaveTypeCreateSchema,
  LeaveTypeUpdateSchema,
  TaxBandsReplaceSchema,
  DepartmentCreateSchema,
  DepartmentUpdateSchema,
  PayrollRunCreateSchema,
  PayrollRunSearchSchema,
  LeaveBalanceQuerySchema,
  PayslipLineCreateSchema,
  PayslipLineRemoveSchema,
  SystemAccessGrantSchema,
  LeaveBalanceAdjustSchema,
  LeaveRequestCreateSchema,
  LeaveRequestSearchSchema,
  PayComponentCreateSchema,
  PayComponentUpdateSchema,
  StaffComponentsSetSchema,
  PublicHolidayCreateSchema,
} from "../schemas"
import * as hr from "./server"
import { ApiError } from "@/types"
import { EntityIdSchema } from "@/schemas"
import type { ApiPaginatedResponse } from "@/types"
import { apiTransformSingle } from "@/lib/api-response-serializer"

/** Backend code for "this login has no staff record". Not an error on the self-service page. */
const NO_STAFF_PROFILE = "STAFF_PROFILE_NOT_FOUND"

async function readPage<T>(call: Promise<ApiPaginatedResponse<T>>) {
  const result = await call
  if (!result.success) {
    const { message, statusCode, erroCode } = result.error
    throw new ApiError(message, statusCode, erroCode)
  }
  return { data: result.data, pagination: result.pagination }
}

/* ------------------------------ Departments ------------------------------- */

export const getDepartmentsFn = createServerFn().handler(async () => {
  const { data } = await readPage(hr.getDepartments())
  return data
})

export const createDepartmentFn = createServerFn({ method: "POST" })
  .validator(DepartmentCreateSchema)
  .handler(({ data }) => hr.createDepartment(data))

export const updateDepartmentFn = createServerFn({ method: "POST" })
  .validator(DepartmentUpdateSchema)
  .handler(({ data }) => hr.updateDepartment(data))

export const deleteDepartmentFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(({ data }) => hr.deleteDepartment(data.id))

/* --------------------------------- Staff ---------------------------------- */

export const getStaffListFn = createServerFn()
  .validator(StaffSearchSchema)
  .handler(({ data }) => readPage(hr.getStaffList(data)))

export const getStaffFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(({ data }) => apiTransformSingle(hr.getStaff(data.id)))

export const createStaffFn = createServerFn({ method: "POST" })
  .validator(StaffCreateSchema)
  .handler(({ data }) => hr.createStaff(data))

export const updateStaffFn = createServerFn({ method: "POST" })
  .validator(StaffUpdateSchema)
  .handler(({ data }) => hr.updateStaff(data))

export const deleteStaffFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(({ data }) => hr.deleteStaff(data.id))

export const terminateStaffFn = createServerFn({ method: "POST" })
  .validator(StaffTerminateSchema)
  .handler(({ data }) => hr.terminateStaff(data))

export const grantSystemAccessFn = createServerFn({ method: "POST" })
  .validator(SystemAccessGrantSchema)
  .handler(({ data }) => hr.grantSystemAccess(data))

export const revokeSystemAccessFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(({ data }) => hr.revokeSystemAccess(data.id))

export const getStaffCompensationFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(({ data }) => apiTransformSingle(hr.getStaffCompensation(data.id)))

export const setStaffCompensationFn = createServerFn({ method: "POST" })
  .validator(CompensationSetSchema)
  .handler(({ data }) => hr.setStaffCompensation(data))

export const setStaffComponentsFn = createServerFn({ method: "POST" })
  .validator(StaffComponentsSetSchema)
  .handler(({ data }) => hr.setStaffComponents(data))

/* --------------------------------- Leave ---------------------------------- */

export const getLeaveTypesFn = createServerFn().handler(() =>
  apiTransformSingle(hr.getLeaveTypes())
)

export const createLeaveTypeFn = createServerFn({ method: "POST" })
  .validator(LeaveTypeCreateSchema)
  .handler(({ data }) => hr.createLeaveType(data))

export const updateLeaveTypeFn = createServerFn({ method: "POST" })
  .validator(LeaveTypeUpdateSchema)
  .handler(({ data }) => hr.updateLeaveType(data))

export const deleteLeaveTypeFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(({ data }) => hr.deleteLeaveType(data.id))

export const getPublicHolidaysFn = createServerFn()
  .validator(z.object({ year: z.number().int().optional() }))
  .handler(({ data }) => apiTransformSingle(hr.getPublicHolidays(data.year)))

export const createPublicHolidayFn = createServerFn({ method: "POST" })
  .validator(PublicHolidayCreateSchema)
  .handler(({ data }) => hr.createPublicHoliday(data))

export const deletePublicHolidayFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(({ data }) => hr.deletePublicHoliday(data.id))

export const getLeaveBalancesFn = createServerFn()
  .validator(LeaveBalanceQuerySchema)
  .handler(({ data }) =>
    apiTransformSingle(hr.getLeaveBalances(data.staff_id, data.year))
  )

export const adjustLeaveBalanceFn = createServerFn({ method: "POST" })
  .validator(LeaveBalanceAdjustSchema)
  .handler(({ data }) => hr.adjustLeaveBalance(data))

export const getLeaveRequestsFn = createServerFn()
  .validator(LeaveRequestSearchSchema)
  .handler(({ data }) => readPage(hr.getLeaveRequests(data)))

export const createLeaveRequestFn = createServerFn({ method: "POST" })
  .validator(LeaveRequestCreateSchema)
  .handler(({ data }) => hr.createLeaveRequest(data))

export const approveLeaveRequestFn = createServerFn({ method: "POST" })
  .validator(LeaveDecisionSchema)
  .handler(({ data }) => hr.decideLeaveRequest("approve", data))

export const rejectLeaveRequestFn = createServerFn({ method: "POST" })
  .validator(LeaveDecisionSchema)
  .handler(({ data }) => hr.decideLeaveRequest("reject", data))

export const cancelLeaveRequestFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(({ data }) => hr.cancelLeaveRequest(data.id))

/* -------------------------------- Payroll --------------------------------- */

export const getPayComponentsFn = createServerFn().handler(() =>
  apiTransformSingle(hr.getPayComponents())
)

export const createPayComponentFn = createServerFn({ method: "POST" })
  .validator(PayComponentCreateSchema)
  .handler(({ data }) => hr.createPayComponent(data))

export const updatePayComponentFn = createServerFn({ method: "POST" })
  .validator(PayComponentUpdateSchema)
  .handler(({ data }) => hr.updatePayComponent(data))

export const deletePayComponentFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(({ data }) => hr.deletePayComponent(data.id))

export const getTaxBandsFn = createServerFn().handler(() =>
  apiTransformSingle(hr.getTaxBands())
)

export const replaceTaxBandsFn = createServerFn({ method: "POST" })
  .validator(TaxBandsReplaceSchema)
  .handler(({ data }) => hr.replaceTaxBands(data))

export const getPayrollRunsFn = createServerFn()
  .validator(PayrollRunSearchSchema)
  .handler(({ data }) => readPage(hr.getPayrollRuns(data)))

export const getPayrollRunFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(({ data }) => apiTransformSingle(hr.getPayrollRun(data.id)))

export const createPayrollRunFn = createServerFn({ method: "POST" })
  .validator(PayrollRunCreateSchema)
  .handler(({ data }) => hr.createPayrollRun(data))

export const generatePayrollRunFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(({ data }) => hr.generatePayrollRun(data.id))

export const approvePayrollRunFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(({ data }) => hr.approvePayrollRun(data.id))

export const payPayrollRunFn = createServerFn({ method: "POST" })
  .validator(PayrollRunPaySchema)
  .handler(({ data }) => hr.payPayrollRun(data))

export const cancelPayrollRunFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(({ data }) => hr.cancelPayrollRun(data.id))

export const getPayslipFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(({ data }) => apiTransformSingle(hr.getPayslip(data.id)))

export const addPayslipLineFn = createServerFn({ method: "POST" })
  .validator(PayslipLineCreateSchema)
  .handler(({ data }) => hr.addPayslipLine(data))

export const removePayslipLineFn = createServerFn({ method: "POST" })
  .validator(PayslipLineRemoveSchema)
  .handler(({ data }) => hr.removePayslipLine(data))

/* ------------------------------ Self-service ------------------------------ */

/** The caller's staff record, or null when their login isn't linked to one. */
export const getMyStaffRecordFn = createServerFn().handler(async () => {
  const result = await hr.getMyStaffRecord()
  if (result.error?.code === NO_STAFF_PROFILE) return null
  return apiTransformSingle(Promise.resolve(result))
})

export const getMyLeaveTypesFn = createServerFn().handler(() =>
  apiTransformSingle(hr.getMyLeaveTypes())
)

export const getMyLeaveBalancesFn = createServerFn()
  .validator(z.object({ year: z.number().int().optional() }))
  .handler(({ data }) => apiTransformSingle(hr.getMyLeaveBalances(data.year)))

export const getMyLeaveRequestsFn = createServerFn().handler(async () => {
  const { data } = await readPage(hr.getMyLeaveRequests())
  return data
})

export const requestMyLeaveFn = createServerFn({ method: "POST" })
  .validator(MyLeaveRequestSchema)
  .handler(({ data }) => hr.requestMyLeave(data))

export const cancelMyLeaveFn = createServerFn({ method: "POST" })
  .validator(EntityIdSchema)
  .handler(({ data }) => hr.cancelMyLeave(data.id))

export const getMyPayslipsFn = createServerFn().handler(() =>
  apiTransformSingle(hr.getMyPayslips())
)
