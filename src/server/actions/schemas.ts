import z from "zod"

export const SearchLocationSchema = z.object({
    query: z.string(),
    sessionId: z.string().nullable().optional()
})

export const QueryPlaceDetailsSchema = z.object({
    placeId: z.string(),
    sessionId: z.string().nullable().optional()
})

export type SearchLocationDto = z.infer<typeof SearchLocationSchema>

export type QueryPlaceDetailsDto = z.infer<typeof QueryPlaceDetailsSchema>

export interface PlaceDetails {
  placeId: string
  address1: string
  address2: string
  formattedAddress: string
  city: string
  region: string
  postalCode: string
  country: string
  lat: number
  lng: number
}

export type LocationSuggestion = {
  placeId: string
  name: string
}

export type LocationDistanceTime = {
  estimated_cost: string
  distance: number
  duration: number
  polyline: string
}