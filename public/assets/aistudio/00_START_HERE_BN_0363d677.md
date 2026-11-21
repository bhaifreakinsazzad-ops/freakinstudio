# FREAKIN’S STUDIO — Repository Integration Readiness / Owner Guide
**Audit date:** 2026-11-21 (Asia/Dhaka)
**Repository:** https://github.com/bhaifreakinsazzad-ops/freakinstudio
**Read-only snapshot:** `main` commit `9241d1cc41ff57f8710520cdfab65abdc47e827c` (commit timestamp: 2026-11-17 01:49 UTC)
**Open, unmerged draft:** PR #6 (`feat/client-portal-real-project-data-20261120`, head `762a6f011842f740120ab2afc37410115d14d69d`)

## আমরা কী প্রস্তুত করেছি
1. **Codebase Audit:** বর্তমান Next.js/Supabase অ্যাপের পুনর্ব্যবহারযোগ্য অংশ, ভুল ও অসমাপ্ত অংশ।
2. **Chief Coding Agent Master Prompt:** Frontend Prototype পরে সংযুক্ত করলেই বাস্তব কোডবেসে কাজে নামার জন্য ধাপভিত্তিক নির্দেশনা।
3. **File-by-File Mapping:** বর্তমান ফাইল, কী রাখতে/বদলাতে/নতুন বানাতে হবে।
4. **Test/Acceptance Matrix:** কোনো কাজকে COMPLETE বলার জন্য কী যাচাই লাগবে।
5. **Risk & Source Register:** অমিল, ব্লকার এবং Source-of-Truth নীতিমালা।

## নির্ধারিত প্রকৌশল সিদ্ধান্ত
- **Greenfield rebuild নয়।** বিদ্যমান Next.js 16 App Router + React 19 + Tailwind 4 + Supabase-কে ভিত্তি করুন।
- **প্রোটোটাইপই UI/UX Reference, রিপোজিটরি Backend Reference।** Prototype-এর Mock Data/API নয়; তার ডিজাইন, কম্পোনেন্ট, User Flow ও Interaction বাস্তবে পোর্ট করুন।
- **Approved Business Canon:** ৪টি Creative Discipline / ১৩টি Core Service / ১৫টি Scoped Variant / ৫টি Bundle / ১৪টি Add-on। Approved Brand Book, Logo, Hourly Pricebook এবং Express Delivery Rules অগ্রাধিকার পাবে।
- **B+C+D:** (B) বিনামূল্যের সত্যিকার Browser Tools, (C) Login-free limited Studio-sponsored AI, (D) কম-মূল্যের AI Micro-Kits; এর পাশাপাশি Human Creative Services, Client Workspace ও Manual Studio Backend।
- **No invented success:** প্রকৃত প্রকল্প/ক্লায়েন্ট/পেমেন্ট/কাজ/অগ্রগতি/রিভিউ ছাড়া কখনো সেগুলো দেখাবেন না।
- **Code change নয় এই রিভিউতে:** কোনো Branch, PR Merge, Database Migration বা Live Deployment করা হয়নি।

## যখন Frontend Prototype হাতে আসবে
Agent-কে সংযুক্ত করুন:
1. এই ZIP Package-এর **সব ফাইল**;
2. Frontend Designer-এর **পুরো Runnable Prototype** (source + lockfile + assets + 1440/390 screenshots + flow + handoff);
3. ইতোমধ্যে অনুমোদিত **Official Brand Book ও Logo Assets**;
4. **Approved v8/v8.1 Creative Catalog, exact Hourly Pricebook, Bundle Component Hours, Add-on mappings, 10-minute Express Delivery Policy**;
5. আগের `Freakins_Studio_Creative_Office_OS_v2_Complete_Planning_Handoff.zip` ও `Freakins_Studio_Frontend_Prototype_Agent_Handoff_v1.zip`।

**Note:** v2 Planning Bundle-এ পূর্ণ Approved Line-by-Line Hourly Ratebook নেই। সেই মূল Pricebook ছাড়া এজেন্টকে অনুমান করে Price Migration করতে দেওয়া যাবে না।

## কীভাবে ব্যবহার করবেন
- `01_REPOSITORY_AUDIT.md`-এ বর্তমান প্রকৃত অমিল পড়ুন।
- `02_CHIEF_CODING_AGENT_MASTER_PROMPT.md`-এর **পূর্ণ লেখা** Chief Coding Agent-কে দিন।
- `03_SOURCE_TO_TARGET_MAPPING.csv`-কে File-Level Work Map হিসেবে ব্যবহার করুন।
- `04_ACCEPTANCE_TEST_MATRIX.md`-এ পাশ না করলে “Ready/Deployed/Complete” ঘোষণা করবেন না।

**প্রস্তুতি সম্পন্ন:** Integration Research ও Engineering Handoff। **অসম্পন্ন:** Prototype attachment, implementation, live DB verification, end-to-end tests, deployment।
