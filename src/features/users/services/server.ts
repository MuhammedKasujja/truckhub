"use server"

import * as apiClient from "@/lib/api-client"
import { SystemUser } from "@/features/users/types"
import {
  UserAssignRolesType,
  UserCreateSchemaType,
  UserListSearchParams,
  UserUpdateSchemaType,
} from "@/features/users/schemas"
import { EntityId, SearchQuery } from "@/schemas"
import { generateApiSearchParams } from "@/lib/search-params"
import { DEFAULT_FITER_QUERY_PER_PAGE } from "@/config/constants"

export async function getUsers(input: UserListSearchParams) {
  const params = generateApiSearchParams(input)

  const response = await apiClient.getPaginatedFn<SystemUser[]>(`/v1/users/?${params}`)

  if (response.success) {
    return {
      data: { data: response.data, pagination: response.pagination },
    }
  }

  return { error: response.error }
}

export async function getUsersByQuery(query: SearchQuery) {
  return getUsers({
    page: 1,
    perPage: DEFAULT_FITER_QUERY_PER_PAGE,
    sort: [],
    search: query.search ?? "",
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
  return await apiClient.deleteFn<null>(`/v1/users/${userId}`)
}

export async function updateUser(data: Partial<UserUpdateSchemaType>) {
  const { id: userId, ...updateData } = data
  return await apiClient.patchFn<SystemUser>(`/v1/users/${userId}`, updateData)
}

export async function createUser(data: UserCreateSchemaType) {
  return await apiClient.postFn<SystemUser>("/v1/users", data)
}

export async function userAssignRoles(data: UserAssignRolesType) {
  const { user_id, roles } = data
  return await apiClient.postFn<SystemUser>(`/v1/users/${user_id}/roles`, roles)
}

// export async function editUser(
//   data: UserCreateSchemaType | UserUpdateSchemaType,
// ) {
//   if (data instanceof UserCreateSchemaType)
//   return createUser(data);
// }
