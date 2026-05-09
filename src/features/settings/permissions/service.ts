"use server";

import * as apiClient from "@/lib/api-client";
import { Role } from "@/features/settings/permissions/types";
import {
  RoleCreateSchemaType,
  RoleUpdateSchemaType,
} from "@/features/settings/permissions/schemas";

const endpoint = "/v1/permissions/roles";

export async function getRoles() {
  return await apiClient.getFn<Role[]>(endpoint);
}

export async function getRoleById(roleId: number | string) {
  return await apiClient.getFn<Role>(`${endpoint}/${roleId}`);
}

export async function deleteRoleById(roleId: number | string) {
  return await apiClient.deleteFn(`${endpoint}/${roleId}`);
}

export async function updateRole(data: RoleUpdateSchemaType) {
  const { id: roleId, ...rest } = data;
  return await apiClient.putFn(`${endpoint}/${roleId}`, rest);
}

export async function createRole(data: RoleCreateSchemaType) {
  return await apiClient.postFn(endpoint, data);
}

export async function assignPermissionsToRole({
  roleId,
  permissions,
}: {
  roleId: string;
  permissions: string[];
}) {
  return await apiClient.postFn<Role>(`/v1/permissions/roles/${roleId}/permissions`, {
    permissions,
  });
}

export async function fetchPermissions() {
  try {
    const response = await apiClient.postFn<string[]>(
      "/v1/permissions/generate",
      {},
    );
    return response.data;
  } catch (error) {
    console.log("Error fetchPermissions");
  }
}
