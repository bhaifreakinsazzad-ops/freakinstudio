/**
 * One-shot extraction tool: pulls the authoritative 60-service catalog out
 * of the preserved legacy prototype and writes it to supabase/seed/data/ as
 * JSON, so the real database can be seeded with verbatim (not fabricated)
 * data. See docs/LEGACY_AUDIT.md §2-3 for what's being extracted and why.
 *
 * Deliberately does NOT use eval()/new Function()/node:vm on the downloaded
 * HTML file — it's treated as untrusted input. Instead this does a small
 * hand-written literal-to-JSON conversion (quote bare keys, convert
 * single-quoted JS strings to JSON strings, strip trailing commas) so the
 * extracted array/object literals can go through JSON.parse.
 *
 * Usage: npx tsx scripts/extract-legacy-catalog.ts
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const LEGACY_PATH = path.resolve(
  __dirname,
  "../reference/legacy/freakin_s_studio_creative_commerce_os.html",
);
const OUT_DIR = path.resolve(__dirname, "../supabase/seed/data");

type RawService = {
  id: string;
  cat: string;
  title: string;
  bn: string;
  baseUSD: number;
  baseBDT: number;
  days: number;
  revisions: number;
  pricingStatus: "approved" | "quote_required";
  addOns: string[];
};

type RawCategory = { id: string; name: string; bn: string; count: number };

/** Finds the `[`..`]` (or `{`..`}`) span of `const <name> = <literal>` in `source`. */
function extractLiteralSource(source: string, name: string): string {
  const needle = `${name} = `;
  const declIdx = source.indexOf(needle);
  if (declIdx === -1) {
    throw new Error(`Could not find declaration for "${name}" in legacy file`);
  }
  const literalStart = declIdx + needle.length;
  const openChar = source[literalStart];
  if (openChar !== "[" && openChar !== "{") {
    throw new Error(`Expected "${name}" to start with [ or {, found "${openChar}"`);
  }
  const closeChar = openChar === "[" ? "]" : "}";

  let depth = 0;
  let inString: '"' | "'" | null = null;
  for (let i = literalStart; i < source.length; i++) {
    const ch = source[i];
    const prev = source[i - 1];

    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === "/" && source[i + 1] === "/") {
      const nl = source.indexOf("\n", i);
      i = nl === -1 ? source.length : nl;
      continue;
    }
    if (ch === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length : end + 1;
      continue;
    }
    if (ch === openChar) depth++;
    if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        return source.slice(literalStart, i + 1);
      }
    }
  }
  throw new Error(`Unbalanced literal for "${name}" — never found matching "${closeChar}"`);
}

/** Converts a JS object/array literal (bare keys, single-quoted strings,
 * // and /* *\/ comments) into JSON text. */
function literalToJson(literal: string): string {
  let out = "";
  let i = 0;
  while (i < literal.length) {
    const ch = literal[i];
    const next = literal[i + 1];

    if (ch === "'" || ch === '"') {
      const quote = ch;
      let j = i + 1;
      let raw = "";
      while (j < literal.length && !(literal[j] === quote && literal[j - 1] !== "\\")) {
        raw += literal[j];
        j++;
      }
      // Unescape the original JS escaping, then re-escape as JSON.
      const unescaped = raw
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
      out += JSON.stringify(unescaped);
      i = j + 1;
      continue;
    }

    if (ch === "/" && next === "/") {
      const nl = literal.indexOf("\n", i);
      i = nl === -1 ? literal.length : nl + 1;
      continue;
    }
    if (ch === "/" && next === "*") {
      const end = literal.indexOf("*/", i + 2);
      i = end === -1 ? literal.length : end + 2;
      continue;
    }

    out += ch;
    i++;
  }

  // Quote bare object keys: { id: ...  or  , title: ...
  out = out.replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)(\s*:)/g, '$1"$2"$3');
  // Strip trailing commas before a closing bracket/brace.
  out = out.replace(/,(\s*[}\]])/g, "$1");

  return out;
}

function extractLiteral<T>(source: string, name: string): T {
  const raw = extractLiteralSource(source, name);
  const json = literalToJson(raw);
  return JSON.parse(json) as T;
}

/** Deterministic UUID-shaped id derived from a label, so re-running the
 * extractor yields stable add_on ids across runs (needed for idempotent
 * upserts in scripts/seed-services.ts). Not a real UUIDv5, just
 * UUID-shaped and stable — sufficient for a primary key we control. */
function stableId(label: string): string {
  const hash = createHash("sha256").update(`freakins-studio-addon:${label}`).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "4" + hash.slice(13, 16),
    "8" + hash.slice(17, 20),
    hash.slice(20, 32),
  ].join("-");
}

function main() {
  const source = readFileSync(LEGACY_PATH, "utf-8");

  const categories = extractLiteral<RawCategory[]>(source, "SERVICE_CATEGORIES");
  const services = extractLiteral<RawService[]>(source, "INITIAL_CANONICAL_SERVICES");
  const addOnPrices = extractLiteral<{ USD: number; BDT: number }>(
    source,
    "ADD_ON_UNIT_PRICES",
  );

  if (services.length !== 60) {
    throw new Error(
      `Expected exactly 60 services, extracted ${services.length}. ` +
        `This is an extractor bug — do not pad or fabricate rows to reach 60.`,
    );
  }

  const expectedCounts: Record<string, number> = {
    A: 10, B: 8, C: 12, D: 8, E: 8, F: 7, G: 7,
  };
  for (const [cat, expected] of Object.entries(expectedCounts)) {
    const actual = services.filter((s) => s.cat === cat).length;
    if (actual !== expected) {
      throw new Error(`Category ${cat}: expected ${expected} services, found ${actual}`);
    }
  }

  const serviceCategoriesOut = categories.map((c, i) => ({
    id: c.id,
    name: c.name,
    name_bn: c.bn,
    sort_order: i + 1,
  }));

  const servicesOut = services.map((s) => ({
    id: s.id,
    category_id: s.cat,
    title: s.title,
    title_bn: s.bn,
    base_usd: s.baseUSD,
    base_bdt: s.baseBDT,
    days: s.days,
    revisions: s.revisions,
    pricing_status: s.pricingStatus,
  }));

  const addOnLabels = Array.from(new Set(services.flatMap((s) => s.addOns))).sort();
  const addOnsOut = addOnLabels.map((label) => ({
    id: stableId(label),
    label,
    unit_price_usd: addOnPrices.USD,
    unit_price_bdt: addOnPrices.BDT,
  }));
  const addOnIdByLabel = new Map(addOnsOut.map((a) => [a.label, a.id]));

  const serviceAddOnsOut = services.flatMap((s) =>
    s.addOns.map((label) => ({
      service_id: s.id,
      add_on_id: addOnIdByLabel.get(label)!,
    })),
  );

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    path.join(OUT_DIR, "service-categories.json"),
    JSON.stringify(serviceCategoriesOut, null, 2) + "\n",
  );
  writeFileSync(
    path.join(OUT_DIR, "services.json"),
    JSON.stringify(servicesOut, null, 2) + "\n",
  );
  writeFileSync(path.join(OUT_DIR, "add-ons.json"), JSON.stringify(addOnsOut, null, 2) + "\n");
  writeFileSync(
    path.join(OUT_DIR, "service-add-ons.json"),
    JSON.stringify(serviceAddOnsOut, null, 2) + "\n",
  );

  console.log(
    `Extracted ${serviceCategoriesOut.length} categories, ${servicesOut.length} services, ` +
      `${addOnsOut.length} unique add-ons, ${serviceAddOnsOut.length} service-add-on links.`,
  );
}

main();
