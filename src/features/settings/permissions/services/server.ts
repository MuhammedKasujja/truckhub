"use server"

import * as apiClient from "@/lib/api-client"
import { Role } from "@/features/settings/permissions/types"
import {
  RoleCreateSchemaType,
  RoleUpdateSchemaType,
  AssignPermissionsToRoleSchemaType,
} from "@/features/settings/permissions/schemas"

const endpoint = "/v1/roles"

export async function getRoles() {
  return await apiClient.getFn<Role[]>(endpoint)
}

export async function getRoleById(roleId: number | string) {
  return await apiClient.getFn<Role>(`${endpoint}/${roleId}`)
}

export async function deleteRoleById(roleId: number | string) {
  return await apiClient.deleteFn(`${endpoint}/${roleId}`)
}

export async function updateRole(data: RoleUpdateSchemaType) {
  const { id: roleId, ...rest } = data
  return await apiClient.putFn<Role>(`${endpoint}/${roleId}`, rest)
}

export async function createRole(data: RoleCreateSchemaType) {
  return await apiClient.postFn<Role>(endpoint, data)
}

export async function assignPermissionsToRole({
  roleId,
  permissions,
}: AssignPermissionsToRoleSchemaType) {
  return await apiClient.postFn<Role>(`${endpoint}/${roleId}/permissions`, {
    permissions,
  })
}

/**
 * Every permission name the backend knows, including the `<name>:own`
 * variants of ownable actions. Read-only: it used to call
 * `POST /v1/permissions/generate`, which regenerates (and deletes) rows.
 */
export async function fetchPermissions(): Promise<string[]> {
  const { data, error } = await apiClient.getFn<string[]>("/v1/permissions")
  if (error) {
    // The matrix still works without it, just with no "own" options
    console.error("fetchPermissions failed", error.message)
    return []
  }
  return data ?? []
}
