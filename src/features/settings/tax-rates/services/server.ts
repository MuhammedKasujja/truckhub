"use server";

import * as apiClient from "@/lib/api-client";
import { TaxRate } from "@/features/settings/tax-rates/types";
import {
  TaxRateCreateSchemaType,
  TaxRateUpdateSchemaType,
} from "@/features/settings/tax-rates/schemas";

const endpoint = "v1/tax-rates"

export async function getTaxRates() {
  const { data, isSuccess, error } =
    await apiClient.getFn<TaxRate[]>(endpoint);
  return { data: isSuccess ? data! : [], error };
}

export async function getTaxRateById(TaxRateId: number | string) {
  return await apiClient.getFn<TaxRate>(`${endpoint}/${TaxRateId}`);
}

export async function deleteTaxRateById(TaxRateId: number | string) {
  return await apiClient.deleteFn(`${endpoint}/${TaxRateId}`);
}

export async function updateTaxRate(data: TaxRateUpdateSchemaType) {
  const { id: TaxRateId, ...rest } = data;
  return await apiClient.putFn<TaxRate>(`${endpoint}/${TaxRateId}`, rest);
}

export async function createTaxRate(data: TaxRateCreateSchemaType) {
  return await apiClient.postFn<TaxRate>(endpoint, data);
}
