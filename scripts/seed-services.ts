/**
 * Upserts the extracted legacy catalog (supabase/seed/data/*.json, produced
 * by scripts/extract-legacy-catalog.ts) into the hosted Supabase project.
 * Idempotent — safe to re-run. Requires SUPABASE_SERVICE_ROLE_KEY (RLS
 * write policies on the catalog tables are admin-only; this script bypasses
 * RLS entirely via the service-role key, the same way a real admin
 * operation would).
 *
 * Usage: npx tsx scripts/seed-services.ts
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database.types";

type Tables = Database["public"]["Tables"];

config({ path: path.resolve(__dirname, "../.env.local") });

const DATA_DIR = path.resolve(__dirname, "../supabase/seed/data");

function readJson<T>(file: string): T[] {
  return JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf-8")) as T[];
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local",
    );
  }

  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const categories = readJson<Tables["service_categories"]["Insert"]>(
    "service-categories.json",
  );
  const services = readJson<Tables["services"]["Insert"]>("services.json");
  const addOns = readJson<Tables["add_ons"]["Insert"]>("add-ons.json");
  const serviceAddOns = readJson<Tables["service_add_ons"]["Insert"]>(
    "service-add-ons.json",
  );

  const { error: catErr } = await supabase
    .from("service_categories")
    .upsert(categories, { onConflict: "id" });
  if (catErr) throw catErr;
  console.log(`Seeded ${categories.length} service_categories`);

  const { error: svcErr } = await supabase.from("services").upsert(services, { onConflict: "id" });
  if (svcErr) throw svcErr;
  console.log(`Seeded ${services.length} services`);

  const { error: addOnErr } = await supabase
    .from("add_ons")
    .upsert(addOns, { onConflict: "id" });
  if (addOnErr) throw addOnErr;
  console.log(`Seeded ${addOns.length} add_ons`);

  const { error: joinErr } = await supabase
    .from("service_add_ons")
    .upsert(serviceAddOns, { onConflict: "service_id,add_on_id" });
  if (joinErr) throw joinErr;
  console.log(`Seeded ${serviceAddOns.length} service_add_ons links`);

  const { count, error: countErr } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true });
  if (countErr) throw countErr;
  if (count !== 60) {
    throw new Error(`Expected 60 rows in services after seeding, found ${count}`);
  }
  console.log("Verified: services table has exactly 60 rows.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
