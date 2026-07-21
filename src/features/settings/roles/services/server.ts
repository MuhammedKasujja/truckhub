"use server";

import * as apiClient from "@/lib/api-client";
import { Role } from "@/features/settings/roles/types";
import {
  RoleCreateSchemaType,
  RoleUpdateSchemaType,
} from "@/features/settings/roles/schemas";

const endpoint = "v1/roles"

export async function getRoles() {
  const { data, isSuccess, error } =
    await apiClient.getFn<Role[]>(endpoint);
  return { data: isSuccess ? data! : [], error };
}

export async function getRoleById(RoleId: number | string) {
  return await apiClient.getFn<Role>(`${endpoint}/${RoleId}`);
}

export async function deleteRoleById(RoleId: number | string) {
  return await apiClient.deleteFn(`${endpoint}/${RoleId}`);
}

export async function updateRole(data: RoleUpdateSchemaType) {
  const { id: RoleId, ...rest } = data;
  return await apiClient.putFn<Role>(`${endpoint}/${RoleId}`, rest);
}

export async function createRole(data: RoleCreateSchemaType) {
  return await apiClient.postFn<Role>(endpoint, data);
}
