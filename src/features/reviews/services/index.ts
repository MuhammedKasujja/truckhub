import {
  ReviewUpdateSchema,
  ReviewCreateSchema,
  ReviewSearchParamsCache,
} from "@/features/reviews/schemas"
import { createServerFn } from "@tanstack/react-start"
import {
  getReviews,
  updateReview,
  createReview,
  getReviewById,
  deleteReviewById,
} from "./data"
import { EntityIdSchema } from "@/schemas"

export const getReviewsFn = createServerFn()
  .inputValidator((data) => ReviewSearchParamsCache.parse(data))
  .handler(async ({ data }) => getReviews(data))

export const getReviewByIdFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getReviewById(data.id)
  })

export const deleteReviewFn = createServerFn()
  .inputValidator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteReviewById(data.id)
  })

export const updateReviewFn = createServerFn()
  .inputValidator(ReviewUpdateSchema)
  .handler(async ({ data }) => {
    return updateReview(data)
  })

export const createReviewFn = createServerFn()
  .inputValidator(ReviewCreateSchema)
  .handler(async ({ data }) => {
    return createReview(data)
  })
