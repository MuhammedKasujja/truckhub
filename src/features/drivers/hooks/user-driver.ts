import { toast } from "sonner"
import { EntityId } from "@/schemas"
import { driverProfileQueryOptions } from "../queries"
import {
  createDriverFn,
  recordDriverTestFn,
  updateDriverFn,
} from "../services"
import { toDriverRequestFormData } from "../driver-form-data"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import {
  DriverCreateSchemaType,
  DriverUpdateSchemaType,
  RecordTestResultInput,
} from "../schemas"
import { createEntityActionHook } from "@/lib/create-entity-action-hook"
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query"

export function useDriverProfileQuery(driverId: EntityId) {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery(driverProfileQueryOptions(driverId))

  return { data: response?.data, error: error, isLoading }
}
export function useDriverProfileSuspenseQuery(driverId: EntityId) {
  const {
    data: response,
    isLoading,
    error,
  } = useSuspenseQuery(driverProfileQueryOptions(driverId))

  return { data: response.data!, error, isLoading }
}

export function useCreateDriver() {
  const invalidator = useQueryInvalidator()
  const mutation = useMutation({
    mutationFn: (input: DriverCreateSchemaType) => {
      return createDriverFn({ data: toDriverRequestFormData(input) })
    },
    onSuccess: () => {
      toast.success("Driver created successfully")
      invalidator.drivers.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  return { ...mutation }
}

export function useEditDriver() {
  const invalidator = useQueryInvalidator()
  const mutation = useMutation({
    mutationFn: (input: DriverUpdateSchemaType) => {
      return updateDriverFn({ data: toDriverRequestFormData(input) })
    },
    onSuccess: (_, input) => {
      toast.success("Driver updated successfully")
      invalidator.drivers.list.invalidate()
      invalidator.drivers.details(input.id).invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  return { ...mutation }
}

const useRecordDriverTestBase = createEntityActionHook(
  recordDriverTestFn,
  (invalidator, input: { data: RecordTestResultInput }) => {
    invalidator.drivers.details(input.data.driverId).invalidate()
    invalidator.drivers.list.invalidate()
  }
)

/** Record or correct the result of one selection test. */
export function useRecordDriverTest() {
  const { isPending, execute } = useRecordDriverTestBase()
  const recordTest = (data: RecordTestResultInput) => execute({ data })
  return { isPending, recordTest }
}
