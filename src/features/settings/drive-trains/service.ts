"use server";

import * as apiClient from "@/lib/api-client";
import { DriveTrain } from "@/features/settings/drive-trains/types";
import {
  DriveTrainCreateSchemaType,
  DriveTrainListSearchParams,
  DriveTrainUpdateSchemaType,
} from "@/features/settings/drive-trains/schemas";

export async function getDriveTrains(input: DriveTrainListSearchParams) {
  const { data, isSuccess, error } =
    await apiClient.getFn<DriveTrain[]>("/v1/drive-trains");
  return { data: isSuccess ? data! : [], error };
}

export async function getDriveTrainById(driveTrainId: number | string) {
  return await apiClient.getFn<DriveTrain>(`/v1/drive-trains/${driveTrainId}`);
}

export async function deleteDriveTrainById(driveTrainId: number | string) {
  return await apiClient.deleteFn(`/v1/drive-trains/${driveTrainId}`);
}

export async function updateDriveTrain(data: DriveTrainUpdateSchemaType) {
  const { id: driveTrainId, ...rest } = data;
  return await apiClient.putFn(`/v1/drive-trains/${driveTrainId}`, rest);
}

export async function createDriveTrain(data: DriveTrainCreateSchemaType) {
  return await apiClient.postFn("/v1/drive-trains", data);
}
