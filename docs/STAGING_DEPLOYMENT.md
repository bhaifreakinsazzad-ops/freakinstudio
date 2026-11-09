# FREAKIN'S STUDIO — STAGING & PRODUCTION DEPLOYMENT GUIDE

**Version:** 1.0.0-RELEASE-CANDIDATE  
**Recommended Platform:** Vercel (recommended for Next.js App Router 16) or AWS / DigitalOcean / Cloud Run via Docker.

---

## 1. Prerequisites Checklist

Before triggering a public deployment, verify that the following accounts and credentials are ready:

- [ ] GitHub repository: `https://github.com/bhaifreakinsazzad-ops/freakinstudio` (on branch `main`).
- [ ] Hosted Supabase Project (Reference: `rvvwhlyqscxtwyqsvdbx`).
- [ ] SSLCOMMERZ Sandbox or Live Merchant Account (Store ID & Password).
- [ ] Stripe Account (Publishable Key, Secret Key, Webhook Secret).
- [ ] Resend or SendGrid API key (for transactional notifications).

---

## 2. Environment Variables Specification

Configure the following variables in your hosting provider's dashboard (e.g. Vercel Project Settings → Environment Variables):

### Next.js Core
```bash
NEXT_PUBLIC_SITE_URL=https://freakinstudio.com
NODE_ENV=production
```

### Supabase Architecture
```bash
NEXT_PUBLIC_SUPABASE_URL=https://rvvwhlyqscxtwyqsvdbx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

### Payment Gateways — SSLCOMMERZ (Bangladesh / BDT)
```bash
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_SANDBOX=false # Set to true for staging sandbox testing
```

### Payment Gateways — Stripe (Global / USD)
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 3. Database Preparation (Supabase)

1. Open your hosted Supabase dashboard: `https://supabase.com/dashboard/project/rvvwhlyqscxtwyqsvdbx`
2. Navigate to **SQL Editor**.
3. Open `supabase/migrations/20261109000009_packages_quotes_orders.sql` from this repository.
4. Copy the entire file content, paste into the SQL Editor, and click **Run**.
5. Verify that `package_drafts`, `quotes`, and `quote_items` tables appear in the **Table Editor**.
6. (Optional) Run `scripts/seed-services.ts` with service role credentials to hydrate remote database tables with the 60 canonical services and 283 add-ons.

---

## 4. Vercel Staging Deployment Procedure

1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **Add New...** → **Project**.
3. Select `bhaifreakinsazzad-ops/freakinstudio` from your GitHub repositories.
4. Set Framework Preset: **Next.js**.
5. Under **Environment Variables**, paste all keys from Section 2.
6. Click **Deploy**.
7. Vercel will automatically build the Next.js 16 app with Turbopack and deploy to an edge-accelerated URL.

---

## 5. Webhook & Callback Configuration

### SSLCOMMERZ Merchant Portal:
- IPN URL: `https://your-domain.com/api/payments/sslcommerz/callback`
- HTTP Method: `POST`

### Stripe Dashboard:
- Webhook URL: `https://your-domain.com/api/payments/stripe/callback`
- Events to listen to: `checkout.session.completed`, `payment_intent.succeeded`
