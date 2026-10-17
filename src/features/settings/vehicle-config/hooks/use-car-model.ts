import { toast } from "sonner"
import { objectToFormData } from "@/lib/form-utils"
import { useMutation } from "@tanstack/react-query"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import {
  CarModelCreateSchemaType,
  CarModelUpdateSchemaType,
} from "../car-model/schemas"
import { createCarModelFn, updateCarModelFn } from "../car-model/services"

export function useCreateCarModel() {
  const invalidator = useQueryInvalidator()
  const mutation = useMutation({
    mutationFn: (input: CarModelCreateSchemaType) => {
      return createCarModelFn({ data: objectToFormData(input) })
    },
    onSuccess: () => {
      toast.success("Car Model created successfully")
      invalidator.drivers.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  return { ...mutation }
}

export function useEditCarModel() {
  const invalidator = useQueryInvalidator()
  const mutation = useMutation({
    mutationFn: (input: CarModelUpdateSchemaType) => {
      return updateCarModelFn({ data: objectToFormData(input) })
    },
    onSuccess: (_, input) => {
      toast.success("Car Model updated successfully")
      invalidator.drivers.list.invalidate()
      invalidator.drivers.details(input.id)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  return { ...mutation }
}
