import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { objectToFormData } from "@/lib/form-utils"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import {
  VehicleCategoryCreateSchemaType,
  VehicleCategoryUpdateSchemaType,
} from "../vehicle-categories/schemas"
import {
  createVehicleCategoryFn,
  updateVehicleCategoryFn,
} from "../vehicle-categories/services"

export function useCreateVehicleCategory() {
  const invalidator = useQueryInvalidator()
  const mutation = useMutation({
    mutationFn: (input: VehicleCategoryCreateSchemaType) => {
      return createVehicleCategoryFn({ data: objectToFormData(input) })
    },
    onSuccess: () => {
      toast.success("Category created successfully")
      invalidator.drivers.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  return { ...mutation }
}

export function useEditVehicleCategory() {
  const invalidator = useQueryInvalidator()
  const mutation = useMutation({
    mutationFn: (input: VehicleCategoryUpdateSchemaType) => {
      return updateVehicleCategoryFn({ data: objectToFormData(input) })
    },
    onSuccess: (_, input) => {
      toast.success("Category updated successfully")
      invalidator.drivers.list.invalidate()
      invalidator.drivers.details(input.id)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  return { ...mutation }
}
