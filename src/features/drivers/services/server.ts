import * as apiClient from "@/lib/api-client"
import { Driver, DriverRow, LicenseRead } from "@/features/drivers/types"
import {
  RecordTestResult,
  DriverCreateSchemaType,
  DriverListSearchParams,
  DriverUpdateSchemaType,
  LicenseChangeRequest,
} from "@/features/drivers/schemas"
import { EntityId, SearchQuery } from "@/schemas"
import { toDriverApiFormData } from "../driver-form-data"
import { generateApiSearchParams } from "@/lib/search-params"
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants"

const endpoint = "/v1/drivers"

export async function getDrivers(input: DriverListSearchParams) {
  const params = generateApiSearchParams(input)

  const response = await apiClient.getPaginatedFn<DriverRow[]>(
    `${endpoint}?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
  }

  return { error: response.error }
}

export async function getDriversByQuery({ search }: SearchQuery) {
  return getDrivers({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  })
}

export async function getDriverById(driverId: EntityId) {
  return await apiClient.getFn<Driver>(`${endpoint}/${driverId}`)
}

export async function getDriverDetailsById(driverId: EntityId) {
  return await apiClient.getFn<Driver>(`${endpoint}/${driverId}`)
}

export async function deleteDriverById(driverId: EntityId) {
  return await apiClient.deleteFn(`${endpoint}/${driverId}`)
}

export async function updateDriver(data: DriverUpdateSchemaType) {
  const { id: driverId, ...fields } = data
  return await apiClient.putFn<Driver>(
    `${endpoint}/${driverId}`,
    toDriverApiFormData(fields)
  )
}

export async function createDriver(input: DriverCreateSchemaType) {
  return await apiClient.postFn<Driver>(endpoint, toDriverApiFormData(input))
}

export async function recordDriverTest(input: RecordTestResult) {
  return await apiClient.putFn<Driver>(
    `${endpoint}/${input.driverId}/tests/${input.testType}`,
    {
      status: input.status,
      tested_on: input.testedOn ?? null,
      notes: input.notes ?? null,
    }
  )
}

/** Replace the driver's current licence; the old one is kept as history. */
export async function changeDriverLicense(input: LicenseChangeRequest) {
  const { id: driverId, ...fields } = input
  return await apiClient.postFn<LicenseRead>(
    `${endpoint}/${driverId}/licenses`,
    toDriverApiFormData(fields)
  )
}
