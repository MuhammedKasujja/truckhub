import { toast } from "sonner"
import { EntityId } from "@/schemas"
import { objectToFormData } from "@/lib/form-utils"
import { driverProfileQueryOptions } from "../queries"
import { createDriverFn, updateDriverFn } from "../services"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { DriverCreateSchemaType, DriverUpdateSchemaType } from "../schemas"
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
      return createDriverFn({ data: objectToFormData(input) })
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
      return updateDriverFn({ data: objectToFormData(input) })
    },
    onSuccess: (_, input) => {
      toast.success("Driver updated successfully")
      invalidator.drivers.list.invalidate()
      invalidator.drivers.details(input.id)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  return { ...mutation }
}
