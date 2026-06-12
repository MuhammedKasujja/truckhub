import { EntityNumberPattern } from "../types"
import { createServerFn } from "@tanstack/react-start"
import { NumberingPatternSchema, NumberingPatternType } from "../schemas"
import { getEntityNumberPatterns, updateEntityNumberPatterns } from "./server"

function transformResponseData(data: EntityNumberPattern[] | undefined) {
  const transformedData: NumberingPatternType = {
    entities: (data ?? []).reduce(
      (acc, item) => {
        acc[item.entity_name] = {
          id: item.id,
          pattern: item.pattern,
          counter_padding: item.counter_padding.toString(),
          last_number: item.last_number,
        }
        return acc
      },
      {} as Record<string, any>
    ),
  }
  return transformedData
}

export const getEntityNumberPatternsFn = createServerFn().handler(async () => {
  const { data, error } = await getEntityNumberPatterns()
  const transformedData = transformResponseData(data)
  return { data: transformedData, error }
})

export const updateEntityNumberPatternsFn = createServerFn({ method: "POST" })
  .inputValidator(NumberingPatternSchema)
  .handler(async ({ data }) => {
    const patterns = Object.entries(data.entities).map(
      ([entity_name, configItem]) => ({
        entity_name,
        pattern: configItem.pattern,
        counter_padding: configItem.counter_padding,
      })
    )
    const { data: reseponse, error, message } =
      await updateEntityNumberPatterns(patterns)

    const transformedData = transformResponseData(reseponse)
    return { data: transformedData, error, message }
  })
