import type { UserRole } from "@/types/database";

/** Доступ в приложение: лид (admin) или legacy lead. */
export function hasAppAccess(role: UserRole | undefined): boolean {
  return role === "lead" || role === "admin";
}

/** Лид для ревью и списка дизайнеров — только admin. */
export function isAdminUser(role: UserRole | undefined): boolean {
  return role === "admin";
}
