import { EntityId } from "@/schemas"
import { DriverCreateSchemaType } from "../schemas"
import { driverProfileQueryOptions } from "../queries"
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
  const mutation = useMutation({
    mutationFn: async (input: DriverCreateSchemaType) => {
      const fd = new FormData()
      fd.append("first_name", input.first_name)
      fd.append("last_name", input.last_name)
      fd.append("phone", input.phone)
      fd.append("email", input.email)
      fd.append("password", input.password)
      if (input.file) fd.append("file", input.file, input.file.name)
    },
  })
  return { ...mutation }
}
