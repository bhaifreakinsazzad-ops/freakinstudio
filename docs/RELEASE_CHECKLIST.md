# FREAKIN'S STUDIO — PRODUCTION RELEASE CHECKLIST

**Version:** 1.0.0-RELEASE-CANDIDATE  
**Release Readiness Gate:** Pre-Flight Verification  

---

## 1. Code Quality & Build Gates
- [x] TypeScript compiler (`npm run typecheck`) passes with 0 errors.
- [x] ESLint (`npm run lint`) passes with 0 warnings and 0 errors.
- [x] Unit test suite (`npm run test:unit`) passes 44/44 tests across 6 suites.
- [x] Next.js 16 Turbopack production build (`npm run build`) compiles all 28 static/dynamic routes.

## 2. Source Control & Repository Alignment
- [x] Intended remote repository configured: `https://github.com/bhaifreakinsazzad-ops/freakinstudio.git`.
- [x] Default remote branch `main` updated and synchronized.
- [x] Working tree clean; no untracked or uncommitted code changes.
- [x] Zero secrets, tokens, or `.env.local` files tracked.

## 3. Database & Supabase Operations
- [x] Live connection verified to Supabase project `rvvwhlyqscxtwyqsvdbx`.
- [x] Migrations 1 through 8 active in remote schema.
- [ ] **Action Required:** Execute `supabase/migrations/20261109000009_packages_quotes_orders.sql` in the Supabase Dashboard SQL Editor.
- [ ] (Optional) Run `npm run seed:catalog` with `SUPABASE_SERVICE_ROLE_KEY` to seed remote tables.

## 4. Payment Merchant Onboarding
- [ ] **SSLCOMMERZ:** Obtain Live Store ID and Store Password from SSLCOMMERZ Operations.
- [ ] **Stripe:** Configure webhook secret and live publishable/secret API keys.
- [x] Development simulation fallback verified for staging and developer evaluation.

## 5. Domain & DNS Configuration
- [ ] Configure custom domain (e.g., `freakinstudio.com`) on Vercel or target host.
- [ ] Add CNAME or A records according to host instructions.
- [ ] Enable automatic SSL/TLS certificate renewal.
