import { createServerFn } from "@tanstack/react-start"
import { NumberingPatternSchema, NumberingPatternType } from "../schemas"
import { getEntityNumberPatterns, updateEntityNumberPatterns } from "./server"

export const getEntityNumberPatternsFn = createServerFn().handler(async () => {
  const { data, error } = await getEntityNumberPatterns()
  const defaultValues: NumberingPatternType = {
    entities: (data ?? []).reduce(
      (acc, item) => {
        acc[item.entity_name] = {
          id: item.id,
          pattern: item.pattern,
          counter_padding: item.counter_padding,
          last_number: item.last_number,
        }
        return acc
      },
      {} as Record<string, any>
    ),
  }
  return { data: defaultValues, error }
})

export const updateEntityNumberPatternsFn = createServerFn({ method: "POST" })
  .inputValidator(NumberingPatternSchema)
  .handler(({ data }) => {
    const patterns = Object.entries(data.entities).map(
      ([entity_name, configItem]) => ({
        entity_name,
        pattern: configItem.pattern,
        counter_padding: configItem.counter_padding,
      })
    )
    return updateEntityNumberPatterns(patterns)
  })
