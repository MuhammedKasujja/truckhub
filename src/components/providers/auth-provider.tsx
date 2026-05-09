"use client";

import { UserPermission } from "@/features/auth/permissions";
import { User } from "@/features/auth/types";
import { hasPermission as checkPermission } from "@/lib/permissions";
import { createContext, useContext, useState, type ReactNode } from "react";

const AuthContext = createContext<{
  user: User;
  hasPermission: (permission: UserPermission) => boolean;
} | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: User;
  children: ReactNode;
}) {
  // TODO: Refresh user and token logic

  const [user] = useState(value); // can later add refresh logic if needed

  const hasPermission = checkPermission(user);

  return (
    <AuthContext.Provider value={{ user, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
