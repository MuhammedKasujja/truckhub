import { createServerFn } from "@tanstack/react-start"
import z from "zod"
import {
  CompensationSetSchema,
  DepartmentCreateSchema,
  DepartmentUpdateSchema,
  LeaveBalanceAdjustSchema,
  LeaveBalanceQuerySchema,
  LeaveDecisionSchema,
  LeaveRequestCreateSchema,
  LeaveRequestSearchSchema,
  LeaveTypeCreateSchema,
  LeaveTypeUpdateSchema,
  MyLeaveRequestSchema,
  PayComponentCreateSchema,
  PayComponentUpdateSchema,
  PayrollRunCreateSchema,
  PayrollRunPaySchema,
  PayrollRunSearchSchema,
  PayslipLineCreateSchema,
  PayslipLineRemoveSchema,
  PublicHolidayCreateSchema,
  StaffComponentsSetSchema,
  StaffCreateSchema,
  StaffSearchSchema,
  StaffTerminateSchema,
  StaffUpdateSchema,
  SystemAccessGrantSchema,
  TaxBandsReplaceSchema,
} from "../schemas"
import * as hr from "./server"
import type { ApiPaginatedResponse, ApiResponse } from "@/types"
import { ApiError } from "@/types"
import { EntityIdSchema } from "@/schemas"

/** Backend code for "this login has no staff record". Not an error on the self-service page. */
const NO_STAFF_PROFILE = "STAFF_PROFILE_NOT_FOUND"

/** Returns the data of a read, or throws so the query shows as failed. */
async function read<T>(call: Promise<ApiResponse<T>>): Promise<T> {
  const result = await call
  if (!result.isSuccess || result.error) {
    throw new ApiError(
      result.error?.message ?? "Couldn't load the data",
      result.error?.statusCode ?? 400
    )
  }
  return result.data as T
}

async function readPage<T>(call: Promise<ApiPaginatedResponse<T>>) {
  const result = await call
  if (!result.success) {
    const { message, statusCode, erroCode } = result.error
    throw new ApiError(message, statusCode, erroCode)
  }
  return { data: result.data, pagination: result.pagination }
}

const post = () => createServerFn({ method: "POST" })

/* ------------------------------ Departments ------------------------------- */

export const getDepartmentsFn = createServerFn().handler(async () => {
  const { data } = await readPage(hr.getDepartments())
  return data
})

export const createDepartmentFn = post()
  .inputValidator(DepartmentCreateSchema)
  .handler(({ data }) => hr.createDepartment(data))

export const updateDepartmentFn = post()
  .inputValidator(DepartmentUpdateSchema)
  .handler(({ data }) => hr.updateDepartment(data))

export const deleteDepartmentFn = post()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => hr.deleteDepartment(data.id))

/* --------------------------------- Staff ---------------------------------- */

export const getStaffListFn = createServerFn()
  .inputValidator(StaffSearchSchema)
  .handler(({ data }) => readPage(hr.getStaffList(data)))

export const getStaffFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => read(hr.getStaff(data.id)))

export const createStaffFn = post()
  .inputValidator(StaffCreateSchema)
  .handler(({ data }) => hr.createStaff(data))

export const updateStaffFn = post()
  .inputValidator(StaffUpdateSchema)
  .handler(({ data }) => hr.updateStaff(data))

export const deleteStaffFn = post()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => hr.deleteStaff(data.id))

export const terminateStaffFn = post()
  .inputValidator(StaffTerminateSchema)
  .handler(({ data }) => hr.terminateStaff(data))

export const grantSystemAccessFn = post()
  .inputValidator(SystemAccessGrantSchema)
  .handler(({ data }) => hr.grantSystemAccess(data))

export const revokeSystemAccessFn = post()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => hr.revokeSystemAccess(data.id))

export const getStaffCompensationFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => read(hr.getStaffCompensation(data.id)))

export const setStaffCompensationFn = post()
  .inputValidator(CompensationSetSchema)
  .handler(({ data }) => hr.setStaffCompensation(data))

export const setStaffComponentsFn = post()
  .inputValidator(StaffComponentsSetSchema)
  .handler(({ data }) => hr.setStaffComponents(data))

/* --------------------------------- Leave ---------------------------------- */

export const getLeaveTypesFn = createServerFn().handler(() =>
  read(hr.getLeaveTypes())
)

export const createLeaveTypeFn = post()
  .inputValidator(LeaveTypeCreateSchema)
  .handler(({ data }) => hr.createLeaveType(data))

export const updateLeaveTypeFn = post()
  .inputValidator(LeaveTypeUpdateSchema)
  .handler(({ data }) => hr.updateLeaveType(data))

export const deleteLeaveTypeFn = post()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => hr.deleteLeaveType(data.id))

export const getPublicHolidaysFn = createServerFn()
  .inputValidator(z.object({ year: z.number().int().optional() }))
  .handler(({ data }) => read(hr.getPublicHolidays(data.year)))

export const createPublicHolidayFn = post()
  .inputValidator(PublicHolidayCreateSchema)
  .handler(({ data }) => hr.createPublicHoliday(data))

export const deletePublicHolidayFn = post()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => hr.deletePublicHoliday(data.id))

export const getLeaveBalancesFn = createServerFn()
  .inputValidator(LeaveBalanceQuerySchema)
  .handler(({ data }) => read(hr.getLeaveBalances(data.staff_id, data.year)))

export const adjustLeaveBalanceFn = post()
  .inputValidator(LeaveBalanceAdjustSchema)
  .handler(({ data }) => hr.adjustLeaveBalance(data))

export const getLeaveRequestsFn = createServerFn()
  .inputValidator(LeaveRequestSearchSchema)
  .handler(({ data }) => readPage(hr.getLeaveRequests(data)))

export const createLeaveRequestFn = post()
  .inputValidator(LeaveRequestCreateSchema)
  .handler(({ data }) => hr.createLeaveRequest(data))

export const approveLeaveRequestFn = post()
  .inputValidator(LeaveDecisionSchema)
  .handler(({ data }) => hr.decideLeaveRequest("approve", data))

export const rejectLeaveRequestFn = post()
  .inputValidator(LeaveDecisionSchema)
  .handler(({ data }) => hr.decideLeaveRequest("reject", data))

export const cancelLeaveRequestFn = post()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => hr.cancelLeaveRequest(data.id))

/* -------------------------------- Payroll --------------------------------- */

export const getPayComponentsFn = createServerFn().handler(() =>
  read(hr.getPayComponents())
)

export const createPayComponentFn = post()
  .inputValidator(PayComponentCreateSchema)
  .handler(({ data }) => hr.createPayComponent(data))

export const updatePayComponentFn = post()
  .inputValidator(PayComponentUpdateSchema)
  .handler(({ data }) => hr.updatePayComponent(data))

export const deletePayComponentFn = post()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => hr.deletePayComponent(data.id))

export const getTaxBandsFn = createServerFn().handler(() =>
  read(hr.getTaxBands())
)

export const replaceTaxBandsFn = post()
  .inputValidator(TaxBandsReplaceSchema)
  .handler(({ data }) => hr.replaceTaxBands(data))

export const getPayrollRunsFn = createServerFn()
  .inputValidator(PayrollRunSearchSchema)
  .handler(({ data }) => readPage(hr.getPayrollRuns(data)))

export const getPayrollRunFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => read(hr.getPayrollRun(data.id)))

export const createPayrollRunFn = post()
  .inputValidator(PayrollRunCreateSchema)
  .handler(({ data }) => hr.createPayrollRun(data))

export const generatePayrollRunFn = post()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => hr.generatePayrollRun(data.id))

export const approvePayrollRunFn = post()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => hr.approvePayrollRun(data.id))

export const payPayrollRunFn = post()
  .inputValidator(PayrollRunPaySchema)
  .handler(({ data }) => hr.payPayrollRun(data))

export const cancelPayrollRunFn = post()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => hr.cancelPayrollRun(data.id))

export const getPayslipFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => read(hr.getPayslip(data.id)))

export const addPayslipLineFn = post()
  .inputValidator(PayslipLineCreateSchema)
  .handler(({ data }) => hr.addPayslipLine(data))

export const removePayslipLineFn = post()
  .inputValidator(PayslipLineRemoveSchema)
  .handler(({ data }) => hr.removePayslipLine(data))

/* ------------------------------ Self-service ------------------------------ */

/** The caller's staff record, or null when their login isn't linked to one. */
export const getMyStaffRecordFn = createServerFn().handler(async () => {
  const result = await hr.getMyStaffRecord()
  if (result.error?.code === NO_STAFF_PROFILE) return null
  return read(Promise.resolve(result))
})

export const getMyLeaveTypesFn = createServerFn().handler(() =>
  read(hr.getMyLeaveTypes())
)

export const getMyLeaveBalancesFn = createServerFn()
  .inputValidator(z.object({ year: z.number().int().optional() }))
  .handler(({ data }) => read(hr.getMyLeaveBalances(data.year)))

export const getMyLeaveRequestsFn = createServerFn().handler(async () => {
  const { data } = await readPage(hr.getMyLeaveRequests())
  return data
})

export const requestMyLeaveFn = post()
  .inputValidator(MyLeaveRequestSchema)
  .handler(({ data }) => hr.requestMyLeave(data))

export const cancelMyLeaveFn = post()
  .inputValidator(EntityIdSchema)
  .handler(({ data }) => hr.cancelMyLeave(data.id))

export const getMyPayslipsFn = createServerFn().handler(() =>
  read(hr.getMyPayslips())
)
