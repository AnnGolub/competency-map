import type { UserRole } from "@/types/database";

export function hasAppAccess(role: UserRole | undefined): boolean {
  return role === "lead" || role === "admin";
}
