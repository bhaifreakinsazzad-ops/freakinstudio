import { describe, expect, it } from "vitest";
import { getSafeAppOrigin, getSafeAppUrl, isValidHttpUrl } from "@/lib/url";

describe("Safe URL parsing helpers", () => {
  it("falls back to default domain when NEXT_PUBLIC_APP_URL is malformed", () => {
    const malformed =
      "NEXT_SUPABASE_URL=https://rvvwhlyqscxtwyqsvdbx.supabase.co";
    expect(isValidHttpUrl(malformed)).toBe(false);
    expect(getSafeAppUrl(malformed).toString()).toBe(
      "https://freakinstudio.space/"
    );
    expect(getSafeAppOrigin(malformed)).toBe("https://freakinstudio.space");
  });

  it("accepts valid http and https URLs and rejects non-http protocols", () => {
    expect(isValidHttpUrl("https://freakinstudio.space")).toBe(true);
    expect(isValidHttpUrl("http://localhost:3000")).toBe(true);
    expect(isValidHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpUrl("")).toBe(false);
    expect(getSafeAppOrigin("https://staging.freakinstudio.space/app")).toBe(
      "https://staging.freakinstudio.space"
    );
  });
});
