/**
 * Proves Phase 1's acceptance line: "database operations work,
 * authentication works and unauthorized access is rejected."
 *
 * Requires a real hosted Supabase project with the Foundation migrations
 * and seed data already applied, and NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY set in
 * .env.test. See docs/IMPLEMENTATION_STATUS.md — this suite is "Blocked
 * by external configuration" until those credentials exist.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { config } from "dotenv";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

config({ path: path.resolve(__dirname, "../../.env.test") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasCredentials = Boolean(url && anonKey && serviceRoleKey);

const describeIfConfigured = hasCredentials ? describe : describe.skip;

describeIfConfigured("RLS and auth isolation (live Supabase project)", () => {
  let admin: SupabaseClient<Database>;
  let userA: SupabaseClient<Database>;
  let userB: SupabaseClient<Database>;
  let userAId: string;
  let userBId: string;
  let adminUserId: string;

  const emailA = `test-a-${Date.now()}@example.com`;
  const emailB = `test-b-${Date.now()}@example.com`;
  const emailAdmin = `test-admin-${Date.now()}@example.com`;
  const password = "correcthorsebatterystaple";

  beforeAll(async () => {
    admin = createClient<Database>(url!, serviceRoleKey!, {
      auth: { persistSession: false },
    });

    const { data: a, error: aErr } = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
    });
    if (aErr || !a.user) throw aErr ?? new Error("failed to create user A");
    userAId = a.user.id;

    const { data: b, error: bErr } = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
    });
    if (bErr || !b.user) throw bErr ?? new Error("failed to create user B");
    userBId = b.user.id;

    const { data: adminUser, error: adminErr } = await admin.auth.admin.createUser({
      email: emailAdmin,
      password,
      email_confirm: true,
    });
    if (adminErr || !adminUser.user) throw adminErr ?? new Error("failed to create admin user");
    adminUserId = adminUser.user.id;

    userA = createClient<Database>(url!, anonKey!, { auth: { persistSession: false } });
    userB = createClient<Database>(url!, anonKey!, { auth: { persistSession: false } });

    const { error: signInAErr } = await userA.auth.signInWithPassword({ email: emailA, password });
    if (signInAErr) throw signInAErr;
    const { error: signInBErr } = await userB.auth.signInWithPassword({ email: emailB, password });
    if (signInBErr) throw signInBErr;
  }, 30_000);

  afterAll(async () => {
    await admin.auth.admin.deleteUser(userAId);
    await admin.auth.admin.deleteUser(userBId);
    await admin.auth.admin.deleteUser(adminUserId);
  });

  it("creates a profiles row automatically with role=customer on signup", async () => {
    const { data, error } = await userA.from("profiles").select("*").eq("id", userAId).single();
    expect(error).toBeNull();
    expect(data?.role).toBe("customer");
  });

  it("does not let user A read user B's profile", async () => {
    const { data, error } = await userA.from("profiles").select("*").eq("id", userBId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("does not let user A escalate their own role", async () => {
    await userA.from("profiles").update({ role: "super_admin" }).eq("id", userAId);
    const { data } = await admin.from("profiles").select("role").eq("id", userAId).single();
    expect(data?.role).toBe("customer");
  });

  it("does not let user B read an organization user A created", async () => {
    const { data: org, error: createErr } = await userA
      .from("organizations")
      .insert({ name: "Org A", slug: `org-a-${Date.now()}`, created_by: userAId })
      .select()
      .single();
    expect(createErr).toBeNull();
    expect(org).not.toBeNull();

    await admin.from("organization_members").insert({
      organization_id: org!.id,
      profile_id: userAId,
      org_role: "owner",
    });

    const { data: seenByB, error: bErr } = await userB
      .from("organizations")
      .select("*")
      .eq("id", org!.id);
    expect(bErr).toBeNull();
    expect(seenByB).toEqual([]);
  });

  it("allows unauthenticated reads of the public catalog but rejects writes", async () => {
    const anon = createClient<Database>(url!, anonKey!, { auth: { persistSession: false } });

    const { data: services, error: readErr } = await anon.from("services").select("*");
    expect(readErr).toBeNull();
    expect(services?.length).toBe(60);

    const { error: writeErr } = await anon.from("services").insert({
      id: "ZZ99",
      category_id: "A",
      title: "Should not be allowed",
      base_usd: 1,
      base_bdt: 1,
      days: 1,
      revisions: 1,
    });
    expect(writeErr).not.toBeNull();
  });

  it("lets a promoted admin read both user A's and user B's profiles", async () => {
    const { error: promoteErr } = await admin
      .from("profiles")
      .update({ role: "studio_admin" })
      .eq("id", adminUserId);
    expect(promoteErr).toBeNull();

    const adminClient = createClient<Database>(url!, anonKey!, {
      auth: { persistSession: false },
    });
    const { error: signInErr } = await adminClient.auth.signInWithPassword({
      email: emailAdmin,
      password,
    });
    expect(signInErr).toBeNull();

    const { data, error } = await adminClient
      .from("profiles")
      .select("id")
      .in("id", [userAId, userBId]);
    expect(error).toBeNull();
    expect(data?.map((r) => r.id).sort()).toEqual([userAId, userBId].sort());
  });
});

if (!hasCredentials) {
  describe("RLS and auth isolation (live Supabase project)", () => {
    it.skip("blocked by external configuration — see .env.test / docs/IMPLEMENTATION_STATUS.md", () => {});
  });
}
