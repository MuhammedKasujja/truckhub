import { User } from "@/features/auth/types";
import {
  UserPermission,
  KeyNamedPermissions,
} from "@/features/auth/permissions";

export function hasPermission(user: User) {
  return (permission: UserPermission) => {
    if (user.is_admin) return true;

    // Lookup the named permissions with the backend corresponding permission names
    const required = KeyNamedPermissions[permission];
    if (!required) return false;

    // return required.every((p) => session.permissions.includes(p));

    // All required permissions must be present in user's list
    // using set for 0(1) lookups
    const userPermSet = new Set(user?.permissions ?? []);

    return required.every((p) => userPermSet.has(p));
  };
}
