# STAGING DEPLOYMENT & ENVIRONMENT STATUS
**Directive 12.0 Priority P4 Audit**
**Date:** 2026-11-10

---

## 1. Local Staging & Production Verification

- **Production Build:** Next.js 16.4.5 (Turbopack) successfully compiled 31 static and dynamic routes.
- **Local Staging Server:** Runs on `http://localhost:3000` via `npm run start` and verified through Playwright headless Chromium tests.
- **Environment Mode:** `NODE_ENV=production` enforces strict live security policies:
  - Development payment simulations are completely disabled.
  - SSLCOMMERZ and Stripe endpoints require real valid merchant credentials.
  - Static fallback pricing rules require explicit administrative approval.

---

## 2. Remote Hosted Staging Deployment Guide

To deploy the verified `main` branch to Vercel, Netlify, or Cloud Run:

1. **Connect GitHub Repository:**
   `https://github.com/bhaifreakinsazzad-ops/freakinstudio` (Branch: `main`)
2. **Configure Production Environment Variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://rvvwhlyqscxtwyqsvdbx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_k05wogcCpRipnxLlj4nzqA_eruRLKJw
   SUPABASE_SERVICE_ROLE_KEY=<your-secret-service-role-key>

   # Merchant Gateways (Fill when ready to accept live transactions)
   SSLCOMMERZ_STORE_ID=
   SSLCOMMERZ_STORE_PASSWD=
   SSLCOMMERZ_IS_SANDBOX=true

   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   ```
3. **Database Migration Execution:**
   Run migrations `20261109000009_packages_quotes_orders.sql` and `20261109000010_trusted_transactions.sql` in the Supabase Dashboard SQL Editor.
4. **Seed Database Catalog:**
   Execute `npm run seed:catalog` once the service role key is populated.
