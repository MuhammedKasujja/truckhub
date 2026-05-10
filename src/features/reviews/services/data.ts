"use server";

import  * as apiClient from "@/lib/api-client";
import { Review } from "@/features/reviews/types";
import {
  ReviewCreateSchemaType,
  ReviewListSearchParams,
  ReviewUpdateSchemaType,
} from "@/features/reviews/schemas";
import { generateApiSearchParams } from "@/lib/search-params";

export async function getReviews(input: ReviewListSearchParams) {
  const { page, perPage } = input;
  const params = generateApiSearchParams(input);

  const {
    data,
    isSuccess,
    error,
    pagination: paginator,
  } = await apiClient.getPaginatedFn<Review[]>(`/v1/reviews/?${params}`);

  const pagination = paginator ?? { page, perPage, totalPages: 0, total: 0 };
  return { data: isSuccess ? data! : [], error, pagination };
}

export async function getReviewById(reviewId: number | string) {
  return await apiClient.getFn<Review>(`/v1/reviews/${reviewId}`);
}

export async function deleteReviewById(reviewId: number | string) {
  return await apiClient.deleteFn(`/v1/reviews/${reviewId}`);
}

export async function updateReview(data: ReviewUpdateSchemaType) {
  const { id: reviewId, ...rest } = data;
  return await apiClient.putFn(`/v1/reviews/${reviewId}`, rest);
}

export async function createReview(data: ReviewCreateSchemaType) {
  return await apiClient.postFn("/v1/reviews", data);
}
