# Security & Payment Audit — Creative Office OS 2.0

**Audit Scope:** Static source review, authorization boundaries, RLS/RPC verification, payment callbacks, AI gateway protections, and local runtime HTTP probes (`2026-11-21`).  
**Live Hosted Status:** Hosted Supabase, Stripe, SSLCommerz, and Puter credentials are **not** present in this sandbox; therefore live database RLS execution and live provider callbacks remain **Blocked by external configuration** until staging credentials are supplied.

---

## 1. Multi-Tenant & Role Authorization Matrix

| Surface / Endpoint | Auth Check | Ownership / Role Enforcement | Failure Behavior |
|---|---|---|---|
| `/dashboard` & `/dashboard/projects` | `supabase.auth.getUser()` + proxy middleware redirect | Queries explicitly filter `.eq("client_id", profile.id)` in addition to RLS | Missing profile redirects `/login`; DB outage renders truthful error state (never masked as `[]`) |
| `/dashboard/projects/[id]` | Signed-in user required (`!user` → redirect `/login`) | Verifies `project.client_id === user.id \|\| isAdmin` (and assignee) before querying child briefs/tasks/assets/annotations/events | Missing/unauthorized ID → `404 notFound()`; backend DB error → explicit `503 Service Unavailable` UI (no stock-image fallback) |
| `/api/projects/[id]/download` | `supabase.auth.getUser()` (`401` if unauth) | Enforces `project.client_id === user.id \|\| isAdmin`, `order.payment_status === "paid"` (`402`), `project.status` in `['client_approved','completed']` (`422`), and fails closed `502` if any private Storage file fails download | Unconfigured Supabase → `503`; DB error → `503`; missing row → `404`; never substitutes placeholder files |
| `/admin` & `(admin)/admin/actions.ts` | `verifyAdminAuth()` checks `studio_admin` or `super_admin` | Every server action (`assignProjectLeadAction`, `updateProjectStatusAction`, `postProjectEventAction`, `uploadProjectProofAction`, `updateInquiryStatusAction`, `updateAiGatewayConfigAction`, `issueManualQuoteAction`) verifies role server-side & writes audit/project events | Non-admin returns `403` / `{ ok: false, error: "Forbidden" }`; client navbar aligned to `studio_admin` / `super_admin` |
| `/assets/aistudio/*` | Moved out of `/public/` | Internal prompts, risk registers, audits, and prototype TSX/PDFs relocated to `/docs/archive/aistudio/` | Live probe `GET /assets/aistudio/02_P0_ACCEPTANCE_GATE_5c882316.md` returned **HTTP 404** |

---

## 2. Database RLS & Trusted Financial RPCs (`008`, `011`–`014`)

- **RLS Coverage**: Every table created in `011`–`013` enables Row Level Security:
  - `service_variants`, `commercial_bundles`, `legacy_service_map`: public `SELECT`, admin-only write via `public.is_admin()`.
  - `inquiries`: no public `SELECT`/`UPDATE`; admin-only read/update (`public.is_admin()`). Writes occur exclusively server-side in `/api/contact` via `createPrivilegedClient()`.
  - `project_events`: client selects only rows where `visibility = 'client'` on owned projects; studio internal notes (`visibility = 'studio_internal'`) remain hidden from clients.
  - `ai_gateway_config`, `ai_usage_events`, `credit_ledger`, `microkit_orders`: strict self (`auth.uid() = user_id`) or `public.is_admin()` read policies; mutations occur server-side using privileged client / RPCs.
- **Trusted RPC Hardening (`20261121000014_fix_trusted_rpcs.sql`)**:
  - `create_quotation_request`: enforces `auth.uid() = p_client_id OR is_admin()`, `p_terms_accepted = true`, valid service IDs, variant multipliers, active add-ons, and `Asia/Dhaka` 5% launch promo window (`2026-11-20` to `2026-12-15`).
  - `create_pending_order`: blocks self-serve direct checkout whenever any line lacks `pricing_status = 'approved' AND ratebook_approved = true` unless backed by an admin-issued, unexpired `quotes` row belonging to the caller.
  - `settle_verified_payment`: validates order existence, exact currency & amount match (`>= expected`), prevents double settlement (`idempotent`), updates `orders.payment_status = 'paid'`, inserts verified `payments` record, and idempotently creates the `projects` + `project_briefs` + initial `project_events` row.

---

## 3. Quote Acceptance, Checkout & Payment Callback Integrity

1. **Stub Eliminated**: `src/app/(client)/actions.ts::acceptQuoteAndCheckoutAction()` validates authenticated ownership, checks `quotes.status === "issued"` and expiry (`expires_at`), creates a real pending order via `create_pending_order`, initiates a real `stripe` / `sslcommerz` / `dev_test_adapter` checkout session, and redirects **only** to the validated provider URL.
2. **Webhook / Callback Verification**:
   - **Stripe** (`/api/payments/stripe/callback`): verifies session status (`payment_status === 'paid'`), currency, and amount via Stripe API + `STRIPE_SECRET_KEY`.
   - **SSLCommerz** (`/api/payments/sslcommerz/callback`): validates via SSLCommerz `validationserverAPI.php` using `val_id`, `store_id`, `store_passwd`, and exact amount/currency match.
   - **Dev-Test Adapter** (`/api/payments/dev-test/callback`): strictly gated behind `ENABLE_DEV_PAYMENT_SIMULATION === "true"` outside production (`NODE_ENV !== "production"`), verified using HMAC-SHA256 `dev_token` bound to `orderRef + amount + currency`.
3. **Contact Form Durability (`/api/contact`)**:
   - In-memory `Map` stub replaced with privileged Postgres persistence into `public.inquiries` + `audit_logs` receipt (`FS-INQ-*`), duplicate submission protection, and fail-closed **HTTP 503** with official WhatsApp (`+8801778307704`) and email (`bhaifreakinstudio@gmail.com`) fallback when DB credentials are unavailable.

---

## 4. AI Gateway & Micro-Kit Safeguards

- **Zero Puter Login for Visitors**: Visitors never authenticate to Puter. Only server-side `PUTER_SERVER_TOKEN` triggers live `PuterSponsoredProvider`; otherwise `DemoTemplateProvider` executes and returns explicit `isRealAi: false` + `gatewayMode: "DEMO_TEMPLATE_FALLBACK"` warnings.
- **No Client-Controlled Kill Switch**: `POST /api/ai/generate` ignores any client-supplied kill-switch flag and checks `process.env.STUDIO_AI_KILL_SWITCH` + DB `ai_gateway_config.kill_switch_active`.
- **Signed Guest Session & Quota**: Uses HMAC-SHA256 `fs_ai_sid` HTTP-only cookie (`AI_GUEST_COOKIE_SECRET`) enforcing daily guest quota (`guest_daily_quota`) and studio daily spend cap (`daily_budget_cap_bdt`).
- **AI Micro-Kits Merchant Gate**: `SKU-SHOP-49`, `SKU-CAMP-99`, and `SKU-BRAND-199` server logic implements order creation, credit ledger holds/settlements, and failure refunds (`src/lib/microkits/service.ts`), while public UI keeps paid checkout gated behind merchant webhook verification.

---

## 5. Security Verification Matrix Summary

| Check | Status | Notes |
|---|---|---|
| No hardcoded API keys / secrets in client code | **PASS** | All keys (`SUPABASE_SERVICE_ROLE_KEY`, `PUTER_SERVER_TOKEN`, `STRIPE_SECRET_KEY`, `SSLCOMMERZ_STORE_PASSWORD`, `AI_GUEST_COOKIE_SECRET`) read strictly server-side |
| Internal planning docs removed from public static root | **PASS** | Moved to `/docs/archive/aistudio/`; HTTP `/assets/aistudio/*` verified `404` |
| Missing/unauthorized project download fail-closed | **PASS** | Returns `503` if unconfigured/DB unavailable, `401` unauth, `403` wrong tenant, `402` unpaid, `422` unapproved |
| Live hosted RLS (`rls-auth.test.ts`, 7 tests) | **BLOCKED** | Requires staging `.env.test` (`NEXT_PUBLIC_SUPABASE_URL`, anon key, service role key) |
| Live Stripe / SSLCommerz webhook end-to-end | **BLOCKED** | Requires staging merchant credentials |
