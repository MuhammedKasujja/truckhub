import { createServerFn } from "@tanstack/react-start"
import { updateEntityNumberPatternSchema } from "../schemas"
import { getEntityNumberPatterns, updateEntityNumberPatterns } from "./server"

export const getEntityNumberPatternsFn = createServerFn().handler(() => {
  return getEntityNumberPatterns()
})

export const updateEntityNumberPatternsFn = createServerFn({ method: "POST" })
  .inputValidator(updateEntityNumberPatternSchema)
  .handler(({ data }) => {
    return updateEntityNumberPatterns(data)
  })
