import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { createCarModelFn, updateCarModelFn } from "../car-model/services"
import type {
  CarModelCreateSchemaType,
  CarModelUpdateSchemaType,
} from "../car-model/schemas"
import { useQueryInvalidator } from "@/hooks/use-query-invalidator"
import { objectToFormData } from "@/lib/form-utils"

export function useCreateCarModel() {
  const invalidator = useQueryInvalidator()
  const mutation = useMutation({
    mutationFn: (input: CarModelCreateSchemaType) => {
      return createCarModelFn({ data: objectToFormData(input) })
    },
    onSuccess: () => {
      toast.success("Car Model created successfully")
      // Also refreshes the cached vehicle configuration.
      invalidator.settings.carModels.list()
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
    onSuccess: () => {
      toast.success("Car Model updated successfully")
      // Also refreshes the cached vehicle configuration.
      invalidator.settings.carModels.list()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
  return { ...mutation }
}
