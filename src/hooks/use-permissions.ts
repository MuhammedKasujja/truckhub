import { useCallback, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";

type PermissionMap = Record<string, string[]>;

export const useGeneratePermissions = (systemPermissions: PermissionMap) => {
  // Map<permission, count>
  const [permissionCount, setPermissionCount] = useState<Map<string, number>>(
    new Map(),
  );

  // --------------------------------------------------
  // Derived state (no need to store separately)
  // --------------------------------------------------
  const selectedPermissions = useMemo(
    () => new Set(permissionCount.keys()),
    [permissionCount],
  );

  // --------------------------------------------------
  // Toggle single permission
  // --------------------------------------------------
  const togglePermission = useCallback((permission: string) => {
    setPermissionCount((prev) => {
      const next = new Map(prev);
      const count = next.get(permission) || 0;

      if (count > 0) {
        // remove
        if (count <= 1) next.delete(permission);
        else next.set(permission, count - 1);
      } else {
        // add
        next.set(permission, 1);
      }

      return next;
    });
  }, []);

  // --------------------------------------------------
  // Toggle module (reference counting safe)
  // --------------------------------------------------
  const toggleModule = useCallback((permissions: string[]) => {
    setPermissionCount((prev) => {
      const next = new Map(prev);

      const allSelected = permissions.every((p) => next.get(p));

      permissions.forEach((p) => {
        const count = next.get(p) || 0;

        if (allSelected) {
          if (count <= 1) next.delete(p);
          else next.set(p, count - 1);
        } else {
          next.set(p, count + 1);
        }
      });

      return next;
    });
  }, []);

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------
  const isSelected = useCallback(
    (permission: string) => selectedPermissions.has(permission),
    [selectedPermissions],
  );

  const isModuleAllSelected = useCallback(
    (permissions: string[]) =>
      permissions.every((p) => selectedPermissions.has(p)),
    [selectedPermissions],
  );

  const isModuleSomeSelected = useCallback(
    (permissions: string[]) =>
      permissions.some((p) => selectedPermissions.has(p)) &&
      !permissions.every((p) => selectedPermissions.has(p)),
    [selectedPermissions],
  );

  // --------------------------------------------------
  // Reset / Set directly (useful for edit forms)
  // --------------------------------------------------
  const setPermissions = useCallback((permissions: string[]) => {
    const map = new Map<string, number>();
    permissions.forEach((p) => map.set(p, 1));
    setPermissionCount(map);
  }, []);

  const clearPermissions = useCallback(() => {
    setPermissionCount(new Map());
  }, []);

  // --------------------------------------------------
  // Optional: get module permissions easily
  // --------------------------------------------------
  const modules = useMemo(
    () => Object.entries(systemPermissions),
    [systemPermissions],
  );

  return {
    // state
    selectedPermissions,
    permissionCount,

    // actions
    togglePermission,
    toggleModule,
    setPermissions,
    clearPermissions,

    // helpers
    isSelected,
    isModuleAllSelected,
    isModuleSomeSelected,

    // data
    modules,
  };
};

export const useHasPermission = () => {
  const { hasPermission } = useAuth();

  return hasPermission;
};
