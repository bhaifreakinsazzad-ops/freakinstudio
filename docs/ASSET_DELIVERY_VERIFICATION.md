# ASSET DELIVERY & CONTRACT LICENSING VERIFICATION
**Directive 12.0 Priority P2 Audit**
**Date:** 2026-11-10
**Endpoint:** `/api/projects/[id]/download`

---

## 1. Deliverable Gating Architecture

Per Directive 11.0 & 12.0 Section 11, the final deliverable ZIP generator implements strict cryptographic and commercial gates:

1. **Authentication & Authorization:**
   - Requester must be authenticated.
   - Requester must be the recorded client on the project or hold `studio_admin` / `super_admin` role. Cross-tenant downloads return `HTTP 403 Forbidden`.
2. **Settlement Verification:**
   - The associated order must be verified as `payment_status === 'paid'`. Unsettled orders return `HTTP 402 Payment Required`.
3. **Approval Status Gating:**
   - The project status must be `client_approved` or `completed`. Unapproved projects return `HTTP 422 Unprocessable Entity`.
4. **Real Asset Verification:**
   - Queries `project_assets` where `is_approved = true`.
   - If zero approved assets exist, returns `HTTP 422 Unprocessable Entity` ("No Approved Deliverables: Studio production team has not yet uploaded or finalized approved master assets for this project").
   - Dummy SVG placeholders and generic vectors have been completely removed.
5. **Contracted Scope & Licensing:**
   - Injects the authoritative contract `scope_snapshot` from the settled order into the signed buyout certificate.
   - Injects the exact file manifest with SHA256 checksums into `DELIVERY-MANIFEST.txt`.
   - Records an immutable `delivery_events` row upon archive generation.
