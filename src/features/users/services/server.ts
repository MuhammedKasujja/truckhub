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

const endpoint = "/v1/users"

export async function getUsers(input: UserListSearchParams) {
  const params = generateApiSearchParams(input)

  const response = await apiClient.getPaginatedFn<SystemUser[]>(
    `${endpoint}/?${params}`
  )

  if (response.success) {
    return { data: response.data, pagination: response.pagination }
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
  return await apiClient.getFn<SystemUser>(`${endpoint}/${userId}`)
}

export async function getUserProfileById() {
  return await apiClient.getFn<SystemUser>(`/v1/auth/me`)
}

export async function deleteUserById(userId: EntityId) {
  return await apiClient.deleteFn<null>(`${endpoint}/${userId}`)
}

export async function updateUser(data: Partial<UserUpdateSchemaType>) {
  const { id: userId, ...updateData } = data
  return await apiClient.patchFn<SystemUser>(`${endpoint}/${userId}`, updateData)
}

export async function createUser(data: UserCreateSchemaType) {
  return await apiClient.postFn<SystemUser>(endpoint, data)
}

export async function userAssignRoles(data: UserAssignRolesType) {
  const { user_id, roles } = data
  return await apiClient.postFn<SystemUser>(`${endpoint}/${user_id}/roles`, roles)
}

// export async function editUser(
//   data: UserCreateSchemaType | UserUpdateSchemaType,
// ) {
//   if (data instanceof UserCreateSchemaType)
//   return createUser(data);
// }
