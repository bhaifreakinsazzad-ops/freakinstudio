# Freakin's Studio — Client Portal Phase 1 (20 Nov 2026)

## Purpose

Begin a real client-facing production workspace using the existing Next.js 16 / Supabase codebase. This phase deliberately excludes pricing changes, live storefront deployment and payments.

## Changes delivered in this branch

1. `/dashboard`: Real customer-owned project list only, ordered newest first. Shows actual project status, actual revision counters and milestone progress based on stored project tasks; never invents progress. Has safe empty state.
2. `/dashboard/projects/[id]`: Authenticate the user, verify customer ownership (or authorized studio administration), load the actual project, brief, tasks, assets, first asset's annotations and the related order. A missing row returns 404; missing tables or failed reads surface an error. **No synthetic tasks, assets or projects.**
3. Data reads include explicit owner/project filters in addition to database RLS.

## Existing work reused

- Supabase authentication and route guards
- Project brief form + server action
- Pin-based annotation/proofing UI
- Revision requests and approval actions
- Studio's existing branding / theme tokens

## Critical launch blockers — not completed in this branch

- The production Supabase instance named in repo environment files is not available through the currently connected Supabase account. Live RLS validation, migration status and project reads have NOT been performed here.
- Full `npm run typecheck`, `npm run lint`, `npm run test:unit`, `npm run test:integration`, `npm run build` were not run in this chat environment. CI must run these checks before merge.
- Project asset preview/storage and authenticated file streaming still require a full end-to-end test, including an actual customer and studio team member.
- Project delivery rules, approvals, multi-user organization access, notifications, comments and production staff assignment need further implementation/verification.
- Existing quote/order/payment code is deliberately outside this branch.

## Required manual acceptance tests on a staging database

1. Customer A can sign in and see only projects owned by Customer A.
2. Customer B cannot access a guessed Customer A project URL or project assets, even by direct database/API request.
3. An unauthenticated request cannot access any dashboard project.
4. A nonexistent project ID returns 404 and displays **no** fake project/task/asset.
5. Customer A can see only task progress backed by real `project_tasks` rows.
6. Customer A can submit the onboarding brief and its saved values appear after refresh.
7. Client can add a pin to a real project asset; it remains after refresh and is inaccessible to others.
8. A revision request changes the actual project/task state and obeys limits.
9. Approval is recorded transactionally and cannot grant access to another client's files.
10. Missing or unprovisioned project tables fail visibly instead of showing a misleading zero project count.
11. Check all policies on `projects`, `project_tasks`, `project_assets`, `project_briefs`, `asset_annotations`, `approvals` for cross-client isolation.

## Next vertical slice

After CI and database validation, implement secure client upload/preview and staff task updates, then client-visible activity timeline and notifications. Only then conduct end-to-end customer acceptance testing.

## Source branch

`feat/client-portal-real-project-data-20261120`. Review by PR before merge.
