"use server";

import { SystemUser } from "./types";
import * as apiClient from "@/lib/api-client";
import {
  UserCreateSchemaType,
  UserListSearchParams,
  UserUpdateSchemaType,
} from "@/features/users/schemas";
import { EntityId, SearchQuery } from "@/types";
import { generateApiSearchParams } from "@/lib/search-params";
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants";

export async function getUsers(input: UserListSearchParams) {
  const { page, perPage } = input;

  const params = generateApiSearchParams(input);

  const {
    data,
    isSuccess,
    pagination: paginator,
    error,
  } = await apiClient.getPaginatedFn<SystemUser[]>(`/v1/users/?${params}`);

  const pagination = paginator ?? { page, perPage, totalPages: 0, total: 0 };

  return { data: isSuccess ? data! : [], pagination, error };
}

export async function getUsersByQuery({ search }: SearchQuery) {
  return getUsers({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  });
}

export async function getUserById(userId: EntityId) {
  return await apiClient.getFn<SystemUser>(`/v1/users/${userId}`);
}

export async function getUserProfileById(userId: EntityId) {
  return await apiClient.getFn<SystemUser>(`/v1/users/${userId}`);
}

export async function deleteUserById(userId: EntityId) {
  return await apiClient.deleteFn(`/v1/users/${userId}`);
}

export async function updateUser(
  userId: EntityId,
  data: Partial<UserUpdateSchemaType>,
) {
  return await apiClient.patchFn(`/v1/users/${userId}`, data);
}

export async function createUser(data: UserCreateSchemaType) {
  return await apiClient.postFn("/v1/users", data);
}

// export async function editUser(
//   data: UserCreateSchemaType | UserUpdateSchemaType,
// ) {
//   if (data instanceof UserCreateSchemaType)
//   return createUser(data);
// }
