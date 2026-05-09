"use server";

import * as apiClient from "@/lib/api-client";
import { AuditLog } from "@/features/audit_logs/types";
import { generateApiSearchParams } from "@/lib/search-params";
import { AuditLogSearchParams } from "@/features/audit_logs/schemas";

const endpoint = "/v1/audit-logs";

export async function getAuditLogs(input: AuditLogSearchParams) {
  const { page, perPage } = input;
  const params = generateApiSearchParams(input);

  const {
    data,
    isSuccess,
    error,
    pagination: paginator,
  } = await apiClient.getPaginatedFn<AuditLog[]>(`${endpoint}?${params}`);

  const pagination = paginator ?? { page, perPage, totalPages: 0, total: 0 };
  return { data: isSuccess ? data! : [], error, pagination };
}
