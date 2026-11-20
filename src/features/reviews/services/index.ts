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
  .validator(ReviewSearchParamsCache)
  .handler(async ({ data }) => getReviews(data))

export const getReviewByIdFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return getReviewById(data.id)
  })

export const deleteReviewFn = createServerFn()
  .validator(EntityIdSchema)
  .handler(async ({ data }) => {
    return deleteReviewById(data.id)
  })

export const updateReviewFn = createServerFn()
  .validator(ReviewUpdateSchema)
  .handler(async ({ data }) => {
    return updateReview(data)
  })

export const createReviewFn = createServerFn()
  .validator(ReviewCreateSchema)
  .handler(async ({ data }) => {
    return createReview(data)
  })
