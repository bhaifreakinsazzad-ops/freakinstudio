import { ADMIN_ROLES, type UserRole } from "@/types/domain";

/** Mirrors the database's public.is_admin() function — kept in sync by
 * hand since there's no shared-codegen path between SQL and TS here. The
 * database policy is the actual authority; this is for UI-level gating
 * only (hiding admin nav items, etc.) and must never be the only check. */
export function isAdminRole(role: UserRole): boolean {
  return (ADMIN_ROLES as UserRole[]).includes(role);
}
