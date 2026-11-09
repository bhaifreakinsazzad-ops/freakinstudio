import { describe, expect, it } from "vitest";
import { isAdminRole } from "@/lib/permissions/roles";
import { USER_ROLES, type UserRole } from "@/types/domain";

describe("Multi-User Tenant Isolation & Security Verification", () => {
  describe("1. Role-Based Access Control Boundaries", () => {
    it("permits super_admin and studio_admin full system governance", () => {
      expect(isAdminRole("super_admin")).toBe(true);
      expect(isAdminRole("studio_admin")).toBe(true);
    });

    it("strictly forbids customer roles from escalating to administrative capabilities", () => {
      const customerRoles: UserRole[] = [
        "customer",
        "customer_org_admin",
        "customer_team_member",
      ];

      for (const role of customerRoles) {
        expect(isAdminRole(role)).toBe(false);
      }
    });

    it("verifies creative production staff are not granted studio admin capabilities", () => {
      const staffRoles: UserRole[] = [
        "designer",
        "video_editor",
        "sales_rep",
        "project_manager",
        "finance_manager",
      ];

      for (const role of staffRoles) {
        expect(isAdminRole(role)).toBe(false);
      }
    });

    it("ensures all canonical USER_ROLES are accounted for in role validation", () => {
      expect(USER_ROLES.length).toBe(10);
      const adminCount = USER_ROLES.filter((r) => isAdminRole(r)).length;
      expect(adminCount).toBe(2);
    });
  });

  describe("2. Customer Tenant Isolation Rules", () => {
    interface ProjectRecord {
      id: string;
      clientId: string;
      title: string;
      orderStatus: "paid" | "awaiting_payment" | "cancelled";
    }

    const customerA = { id: "usr_client_aaa_111", role: "customer" as UserRole };
    const customerB = { id: "usr_client_bbb_222", role: "customer" as UserRole };
    const adminUser = { id: "usr_admin_999", role: "studio_admin" as UserRole };

    const projectA: ProjectRecord = {
      id: "prj_001_aaa",
      clientId: customerA.id,
      title: "Customer A Brand Launch",
      orderStatus: "paid",
    };

    function checkProjectReadAccess(
      user: { id: string; role: UserRole },
      project: ProjectRecord
    ): { allowed: boolean; reason?: string } {
      if (isAdminRole(user.role)) {
        return { allowed: true };
      }
      if (user.id === project.clientId) {
        return { allowed: true };
      }
      return { allowed: false, reason: "Forbidden: Cross-tenant data access blocked" };
    }

    function checkDeliverableDownloadAccess(
      user: { id: string; role: UserRole },
      project: ProjectRecord
    ): { allowed: boolean; statusCode: number } {
      const readAccess = checkProjectReadAccess(user, project);
      if (!readAccess.allowed) {
        return { allowed: false, statusCode: 403 };
      }
      if (project.orderStatus !== "paid") {
        return { allowed: false, statusCode: 402 }; // Payment Required
      }
      return { allowed: true, statusCode: 200 };
    }

    it("allows Customer A to view and access their own project", () => {
      const access = checkProjectReadAccess(customerA, projectA);
      expect(access.allowed).toBe(true);
    });

    it("blocks Customer B from viewing Customer A's project", () => {
      const access = checkProjectReadAccess(customerB, projectA);
      expect(access.allowed).toBe(false);
      expect(access.reason).toContain("Cross-tenant data access blocked");
    });

    it("allows Studio Admin to access project across all customer tenants", () => {
      const access = checkProjectReadAccess(adminUser, projectA);
      expect(access.allowed).toBe(true);
    });

    it("blocks deliverable archive download for unpaid or pending orders (HTTP 402)", () => {
      const unpaidProject: ProjectRecord = {
        ...projectA,
        orderStatus: "awaiting_payment",
      };

      const downloadCheck = checkDeliverableDownloadAccess(customerA, unpaidProject);
      expect(downloadCheck.allowed).toBe(false);
      expect(downloadCheck.statusCode).toBe(402);
    });

    it("permits deliverable download when client owns project and order is paid (HTTP 200)", () => {
      const downloadCheck = checkDeliverableDownloadAccess(customerA, projectA);
      expect(downloadCheck.allowed).toBe(true);
      expect(downloadCheck.statusCode).toBe(200);
    });
  });
});
