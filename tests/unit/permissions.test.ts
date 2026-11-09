import { describe, expect, it } from "vitest";
import { isAdminRole } from "@/lib/permissions/roles";
import { USER_ROLES } from "@/types/domain";

describe("isAdminRole", () => {
  it("treats studio_admin and super_admin as admin roles", () => {
    expect(isAdminRole("studio_admin")).toBe(true);
    expect(isAdminRole("super_admin")).toBe(true);
  });

  it("treats every other role as non-admin", () => {
    const nonAdminRoles = USER_ROLES.filter(
      (role) => role !== "studio_admin" && role !== "super_admin",
    );
    for (const role of nonAdminRoles) {
      expect(isAdminRole(role)).toBe(false);
    }
  });
});
