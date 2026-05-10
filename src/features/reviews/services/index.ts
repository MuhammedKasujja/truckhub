import {
  ReviewCreateSchemaType,
  ReviewUpdateSchemaType,
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

export const getReviewsFn = createServerFn()
  .inputValidator((data) => ReviewSearchParamsCache.parse(data))
  .handler(async ({ data }) => getReviews(data))

export async function getReviewByIdFn(reviewId: number | string) {
  return await getReviewById(reviewId)
}

export async function deleteReviewByIdFn(reviewId: number | string) {
  return deleteReviewById(reviewId)
}

export async function updateReviewFn(data: ReviewUpdateSchemaType) {
  return await updateReview(data)
}

export async function createReviewFn(data: ReviewCreateSchemaType) {
  return await createReview(data)
}
