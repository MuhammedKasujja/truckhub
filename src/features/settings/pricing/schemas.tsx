import { EntityId, IDSchema, MoneySchema } from "@/schemas"
import z from "zod"
import { COMPANY_PRICING_TYPES } from "./types"

export const tonnageRangeSchema = z
  .object({
    min_tons: z
      .number("Required")
      .min(0, "Must be above 0")
      .max(30, "Must be below 30"),
    max_tons: z
      .number("Required")
      .min(0, "Must be above 0")
      .max(30, "Must be below 30"),
    price: z.number("Required").min(0, "Price is required"),
  })
  .refine((d) => d.max_tons > d.min_tons, {
    message: "Max must be greater than min",
    path: ["max_tons"],
  })

export const routePricingSchema = z.object({
  name: z.string().min(1, "Route name is required"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  ranges: z
    .array(tonnageRangeSchema)
    .min(1, "At least 1 tonnage range is required"),
})

export const batchPricingSchema = z.object({
  valid_from: z.date("Pricing date is required"),
  client_id: IDSchema.optional().nullable(),
  routes: z.array(routePricingSchema).min(1, "Add at least one route"),
})

export type TonnageRangeInput = z.infer<typeof tonnageRangeSchema>
export type BatchPricingInput = z.infer<typeof batchPricingSchema>

export const PriceRangeSchema = z.object({
  min_tons: z.number(),
  max_tons: z.number(),
  price: z.union([z.number(), z.string()]),
})

export type PriceRange = z.infer<typeof PriceRangeSchema>

export const RoutePayloadSchema = z.object({
  route_id: IDSchema,
  ranges: z.array(PriceRangeSchema),
})

export type RoutePayload = z.infer<typeof RoutePayloadSchema>

export const BatchPricingPayloadUpdateSchema = z.object({
  valid_from: z.string(),
  client_id: IDSchema.optional().nullable(),
  routes: z.array(RoutePayloadSchema),
})

export const BatchPricingPayloadCreateSchema = z.object({
  valid_from: z.string(),
  routes: z.array(RoutePayloadSchema),
})

export type BatchPayload = z.infer<typeof BatchPricingPayloadUpdateSchema>

export type BatchPricingPayload = z.infer<
  typeof BatchPricingPayloadUpdateSchema
>

export type BatchPricingPayloadCreate = z.infer<
  typeof BatchPricingPayloadCreateSchema
>

/** One row of the single `distance_tonnage_rates` table. */
export const DistancePricingSchema = z.object({
  distance_min_km: z.number(),
  distance_max_km: z.number().optional().nullable(),
  distance_no_upper_limit: z.boolean().default(false),
  tonnage_min: z.number(),
  tonnage_max: z.number(),
  min_price: z.number(),
  max_price: z.number(),
})

export const ListDistancePricingSchema = z.object({
  pricings: z.array(DistancePricingSchema),
  effectiveDate: z.date(),
})

export type ListDistancePricingRequest = z.infer<
  typeof ListDistancePricingSchema
>

export type DistancePricingRequest = z.infer<typeof DistancePricingSchema>

const RangeBoundSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .regex(/^\d+(\.\d+)?$/, "Invalid number")

const loadingOffloadingPricingSchema = z
  .object({
    tonnage_min: RangeBoundSchema,
    tonnage_max: RangeBoundSchema,
    cbm_min: RangeBoundSchema,
    cbm_max: RangeBoundSchema,
    loading_fees: MoneySchema.min(1, "Required"),
    offloading_fees: MoneySchema.min(1, "Required"),
  })
  .superRefine(
    (row, ctx) => {
      for (const key of ["tonnage", "cbm"] as const) {
        const min = toBound(row[`${key}_min`])
        const max = toBound(row[`${key}_max`])
        if (min !== null && max !== null && max <= min) {
          ctx.addIssue({
            code: "custom",
            message: "Must be above min",
            path: [`${key}_max`],
          })
        }
      }
    },
    // Run even while other fields (e.g. fees) are still empty
    {
      when: (payload) =>
        typeof payload.value === "object" && payload.value !== null,
    }
  )

type LoadingRangeKey = "tonnage" | "cbm"

/** Parses a range bound, or null when it's blank / not a number. */
function toBound(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * Each row is a pricing tier, so tonnage ranges must not overlap each other
 * and CBM ranges must not overlap each other. Bounds are inclusive (2–3, 4–6),
 * so a shared boundary (2–3, 3–6) counts as an overlap.
 */
function addLoadingRangeOverlapIssues(
  pricings: LoadingOffloadingPricing[],
  key: LoadingRangeKey,
  ctx: z.RefinementCtx
) {
  const ranges = pricings
    .map((row, index) => ({
      index,
      min: toBound(row[`${key}_min`]),
      max: toBound(row[`${key}_max`]),
    }))
    // Blank or invalid rows already have their own error
    .filter(
      (r): r is { index: number; min: number; max: number } =>
        r.min !== null && r.max !== null && r.max > r.min
    )
    .sort((a, b) => a.min - b.min)

  // Compare against the range reaching furthest so far, so a wide range
  // (0–100) is caught against every later one, not just its neighbour.
  let furthest = ranges.at(0)
  for (const current of ranges.slice(1)) {
    if (!furthest) break
    if (current.min <= furthest.max) {
      ctx.addIssue({
        code: "custom",
        message: `Overlaps ${furthest.min}–${furthest.max}`,
        path: ["pricings", current.index, `${key}_min`],
      })
    }
    if (current.max > furthest.max) furthest = current
  }
}

export const LoadingOffloadingPricingSchema = z
  .object({
    client_id: IDSchema.optional().nullable(),
    pricings: z
      .array(loadingOffloadingPricingSchema)
      .min(1, "Add at least one pricing"),
    effective_date: z.string().min(1, "Required"),
  })
  .superRefine(
    (data, ctx) => {
      addLoadingRangeOverlapIssues(data.pricings, "tonnage", ctx)
      addLoadingRangeOverlapIssues(data.pricings, "cbm", ctx)
    },
    // Run even while other fields (e.g. fees) are still empty
    {
      when: (payload) =>
        Array.isArray((payload.value as { pricings?: unknown }).pricings),
    }
  )

export type LoadingOffloadingPricing = z.infer<
  typeof loadingOffloadingPricingSchema
>

export type LoadingOffloadingPricingRequest = z.infer<
  typeof LoadingOffloadingPricingSchema
>

export const islandPricingSchema = z.object({
  island_id: z.string("Select an island").min(1, "Select an island"),
  price: MoneySchema.min(1, "Required"),
})

export type IslandPricingRequest = z.infer<typeof islandPricingSchema>

export const IslandsListPricingSchema = z
  .object({
    pricings: z.array(islandPricingSchema).min(1, "Add at least one island"),
    effective_date: z.string("Required").min(1, "Required"),
  })
  .superRefine(
    (data, ctx) => {
      // An island can only have one price per version
      const seen = new Set<string>()
      data.pricings.forEach((row, index) => {
        if (!row.island_id) return
        if (seen.has(row.island_id)) {
          ctx.addIssue({
            code: "custom",
            message: "Island is already priced",
            path: ["pricings", index, "island_id"],
          })
        }
        seen.add(row.island_id)
      })
    },
    // Run even while other fields (e.g. prices) are still empty
    {
      when: (payload) =>
        Array.isArray((payload.value as { pricings?: unknown }).pricings),
    }
  )

export type IslandsListPricingRequest = z.infer<typeof IslandsListPricingSchema>

export const PricingSearchParamsCache = z.object({
  referenceDate: z.string().optional(),
})

export type PricingSearchParams = z.infer<typeof PricingSearchParamsCache>

export const ActivePricingSearchParamsCache = z.object({
  clientId: z.string().optional(),
})

export type ActivePricingSearchParams = z.infer<
  typeof ActivePricingSearchParamsCache
>

export const ActivatePricingSchema = z.object({
  effectiveDate: z.string(),
  source: z.enum(COMPANY_PRICING_TYPES),
})

export type ActivatePricingInput = z.infer<typeof ActivatePricingSchema>

export type RoutePricingRow = {
  routeId: EntityId
  origin: string
  destination: string
  distanceKm: string
  minHrs: string
  maxHrs: string
  pricings: { minTons: number; maxTons: number; price: string }[]
}
