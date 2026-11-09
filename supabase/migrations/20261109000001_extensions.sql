-- Freakin's Studio — Foundation migration 1/8
-- Ensure pgcrypto is available for gen_random_uuid(). Supabase projects
-- usually ship with this enabled already; this is an idempotent no-op if so.
create extension if not exists pgcrypto;
