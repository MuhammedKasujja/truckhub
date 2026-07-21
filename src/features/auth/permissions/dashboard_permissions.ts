export const DashboardModulePermissions = {
  "dashboard:view": ["dashboard:module"],
} as const;

export type DashboardPermissions = keyof typeof DashboardModulePermissions;

