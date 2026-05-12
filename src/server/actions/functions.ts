import { createServerFn } from "@tanstack/react-start"
import { QueryPlaceDetailsSchema, SearchLocationSchema } from "./schemas"
import { getLocationDetailsByPlaceId, getLocationSuggestions } from "./location"

export const searchLocationSuggestionsFn = createServerFn({
  method: "POST",
})
  .inputValidator(SearchLocationSchema)
  .handler(({ data }) => {
    return getLocationSuggestions(data)
  })

export const getPlaceDetailsFn = createServerFn({
  method: "POST",
})
  .inputValidator(QueryPlaceDetailsSchema)
  .handler(({ data }) => {
    return getLocationDetailsByPlaceId(data)
  })
