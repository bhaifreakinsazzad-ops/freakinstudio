import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tryPrivilegedClient } from "@/lib/supabase/privileged";
import {
  buildGuestSessionSetCookieHeader,
  getMemoryUsageToday,
  resolveGuestSession,
} from "@/lib/ai/session";
import { getAiProvider } from "@/lib/ai/provider";
import { getCreditBalance } from "@/lib/microkits/service";

export async function GET(request: Request) {
  const guest = resolveGuestSession(request);
  const { isLiveConfigured } = getAiProvider();
  const envKillSwitch =
    process.env.STUDIO_AI_KILL_SWITCH === "true" ||
    process.env.STUDIO_AI_KILL_SWITCH === "1";

  let killSwitchActive = envKillSwitch;
  let guestDailyQuota = Number(process.env.STUDIO_AI_GUEST_DAILY_QUOTA || 3);
  let usedToday = getMemoryUsageToday(guest.sessionId).count;
  let userId: string | null = null;
  let creditBalance = 0;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      userId = null;
    }
  }

  const privileged = tryPrivilegedClient();
  if (privileged) {
    const todayIso = new Date();
    todayIso.setUTCHours(0, 0, 0, 0);

    const [{ data: cfg }, { count }] = await Promise.all([
      privileged
        .from("ai_gateway_config")
        .select("kill_switch_active, guest_daily_quota")
        .eq("id", "default")
        .maybeSingle(),
      privileged
        .from("ai_usage_events")
        .select("id", { count: "exact", head: true })
        .eq("session_id", guest.sessionId)
        .eq("status", "completed")
        .gte("created_at", todayIso.toISOString()),
    ]);

    if (cfg) {
      killSwitchActive = envKillSwitch || Boolean(cfg.kill_switch_active);
      guestDailyQuota = Number(cfg.guest_daily_quota);
    }
    usedToday = count ?? 0;

    if (userId) {
      creditBalance = await getCreditBalance(userId);
    }
  }

  const res = NextResponse.json({
    ok: true,
    puterLoginRequired: false,
    liveAiConfigured: isLiveConfigured,
    mode: isLiveConfigured ? "PUTER_SPONSORED_LIVE" : "DEMO_TEMPLATE_FALLBACK",
    killSwitchActive,
    authenticated: Boolean(userId),
    creditBalance,
    quota: {
      used: usedToday,
      limit: guestDailyQuota,
      remaining: Math.max(0, guestDailyQuota - usedToday),
    },
  });

  if (guest.isNew) {
    res.headers.append(
      "Set-Cookie",
      buildGuestSessionSetCookieHeader(guest.signedCookieValue)
    );
  }

  return res;
}
