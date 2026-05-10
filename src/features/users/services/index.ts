"use server"

import * as apiClient from "@/lib/api-client"
import { SystemUser } from "@/features/users/types"
import {
  UserCreateSchemaType,
  UserUpdateSchemaType,
  UserSearchParamsCache,
} from "@/features/users/schemas"
import { getUsers } from "./data"
import { EntityId, SearchQuery } from "@/types"
import { createServerFn } from "@tanstack/react-start"
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants"

export const getUsersFn = createServerFn()
  .inputValidator((data) => UserSearchParamsCache.parse(data))
  .handler(async ({ data: query }) => {
    const { data, pagination, error } = await getUsers(query)
    if (error) {
    }

    return { data, pagination }
  })

export async function getUsersByQuery({ search }: SearchQuery) {
  return getUsers({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: search ?? "",
    created_at: [],
    filters: [],
    joinOperator: "and",
  })
}

export async function getUserById(userId: EntityId) {
  return await apiClient.getFn<SystemUser>(`/v1/users/${userId}`)
}

export async function getUserProfileById(userId: EntityId) {
  return await apiClient.getFn<SystemUser>(`/v1/users/${userId}`)
}

export async function deleteUserById(userId: EntityId) {
  return await apiClient.deleteFn(`/v1/users/${userId}`)
}

export async function updateUser(
  userId: EntityId,
  data: Partial<UserUpdateSchemaType>
) {
  return await apiClient.patchFn(`/v1/users/${userId}`, data)
}

export async function createUser(data: UserCreateSchemaType) {
  return await apiClient.postFn("/v1/users", data)
}

// export async function editUser(
//   data: UserCreateSchemaType | UserUpdateSchemaType,
// ) {
//   if (data instanceof UserCreateSchemaType)
//   return createUser(data);
// }
