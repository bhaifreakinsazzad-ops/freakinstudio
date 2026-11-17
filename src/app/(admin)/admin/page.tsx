import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllServices, getAllCategories } from "@/lib/catalog";
import {
  AdminConsoleClient,
  type AdminProject,
  type AdminQuote,
  type AdminOrder,
  type AdminAuditLog,
} from "./admin-console-client";

export const metadata: Metadata = {
  title: "Studio Admin & Operations Console — Freakin's Studio",
  description: "Internal Operations OS for live project Kanban, 60-service catalog pricing, quote desk, and audit logs.",
};

export const instant = false;

// High-fidelity fallback records for initial bootstrapping & offline demo
const FALLBACK_PROJECTS: AdminProject[] = [
  {
    id: "proj_demo_001",
    title: "Apex Robotics — Complete Brand Identity & Motion System",
    client_name: "Apex Autonomous Corp",
    client_email: "brand@apexrobotics.ai",
    status: "in_production",
    current_round: 1,
    max_rounds: 3,
    revisions_used: 1,
    max_revisions: 3,
    package_name: "Brand Master System + 3D Kinetic Pack",
    total_amount: 85000,
    currency: "BDT",
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    brief: {
      brand_name: "Apex Robotics",
      deliverable_format: "Vector SVG, 4K ProRes 4444, Design Tokens",
      color_palette: "Obsidian Black, Champagne Gold, Matte Slate",
      notes: "Industrial robotics brand identity for Series-A deep tech robotics startup.",
    },
    tasks: [
      { id: "task_1", title: "Primary Logo Grid & Geometry", status: "completed" },
      { id: "task_2", title: "Design System Guidelines", status: "in_progress" },
      { id: "task_3", title: "Kinetic Logo Reveal 4K", status: "pending" },
    ],
    assets: [
      {
        id: "asset_1",
        title: "Logo Mark Grid V1",
        version: "v1.0",
        file_url: "/images/portfolio/brand-identity.jpg",
        asset_type: "raster_preview",
        annotations_count: 2,
      },
    ],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "proj_demo_002",
    title: "FinPulse — Campaign Ad Suite & Performance Motion",
    client_name: "FinPulse Global Ltd",
    client_email: "growth@finpulse.io",
    status: "client_review",
    current_round: 1,
    max_rounds: 3,
    revisions_used: 1,
    max_revisions: 3,
    package_name: "Campaign Key Visual + Interactive Motion Cuts",
    total_amount: 110000,
    currency: "BDT",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    brief: {
      brand_name: "FinPulse",
      deliverable_format: "Figma Tokens, 4K Renders, Social Cutdowns",
      color_palette: "Deep Obsidian, Emerald Accent, Crisp Linen",
      notes: "Cross-platform mobile fintech launch campaign and brand visual suite.",
    },
    tasks: [
      { id: "task_4", title: "Wireframes & Visual Architecture", status: "completed" },
      { id: "task_5", title: "Campaign Master Assets", status: "completed" },
      { id: "task_6", title: "Client Review & Feedback Stage", status: "in_progress" },
    ],
    assets: [
      {
        id: "asset_2",
        title: "Campaign Key Visual Preview",
        version: "v1.2",
        file_url: "/images/portfolio/ad-campaign.jpg",
        asset_type: "raster_preview",
        annotations_count: 3,
      },
    ],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "proj_demo_003",
    title: "NeuroSynth — 3D Product Film & Launch Motion Suite",
    client_name: "NeuroSynth Audio Labs",
    client_email: "studio@neurosynth.de",
    status: "completed",
    current_round: 2,
    max_rounds: 3,
    revisions_used: 2,
    max_revisions: 3,
    package_name: "Cinematic Product Motion & AI Lookbook",
    total_amount: 1450,
    currency: "USD",
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    brief: {
      brand_name: "NeuroSynth",
      deliverable_format: "4K ProRes 4444, Blender Master, Commercial Buyout",
      color_palette: "Matte Charcoal, Warm Gold",
      notes: "Product reveal motion film and soundscape for hardware launch.",
    },
    tasks: [
      { id: "task_7", title: "3D Product Rig & Lighting", status: "completed" },
      { id: "task_8", title: "Lookbook Frame Delivery", status: "completed" },
      { id: "task_9", title: "Final Master Delivery & Buyout Agreement", status: "completed" },
    ],
    assets: [
      {
        id: "asset_3",
        title: "4K Motion Render Master",
        version: "v2.0-final",
        file_url: "/images/portfolio/video-motion.jpg",
        asset_type: "raster_preview",
        annotations_count: 0,
      },
    ],
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const FALLBACK_QUOTES: AdminQuote[] = [
  {
    id: "q_demo_881",
    quote_ref: "QT-2026-881",
    customer_name: "Synthetix Labs",
    customer_email: "procurement@synthetix.org",
    service_names: ["B02. Complete Brand Identity System", "F02. AI Video & CGI Commercial"],
    scope_summary: "Complete corporate identity + 60s CGI motion trailer for product launch.",
    notes: "Synthetix Labs — B02 Complete Brand Identity + F02 AI CGI Commercial (rush sprint)",
    total_amount: 195000,
    amount_bdt: 195000,
    amount_usd: 1625,
    currency: "BDT",
    rush_delivery: true,
    status: "pending",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q_demo_882",
    quote_ref: "QT-2026-882",
    customer_name: "Kinetix Sports",
    customer_email: "hello@kinetixsports.com",
    service_names: ["C05. 2D/3D Motion Graphics Animation"],
    scope_summary: "Multi-channel product motion kit and campaign deliverables.",
    notes: "Kinetix Sports — C05 Motion Graphics suite + G03 Executive Pitch Deck",
    total_amount: 2400,
    amount_bdt: 288000,
    amount_usd: 2400,
    currency: "USD",
    rush_delivery: false,
    status: "issued",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const FALLBACK_ORDERS: AdminOrder[] = [
  {
    id: "ord_demo_901",
    order_number: "FS-2026-901",
    order_ref: "FS-2026-901",
    customer_name: "Apex Autonomous Corp",
    total_amount: 85000,
    amount_bdt: 85000,
    amount_usd: 710,
    currency: "BDT",
    payment_method: "SSLCOMMERZ (bKash)",
    payment_status: "paid",
    project_status: "in_production",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ord_demo_902",
    order_number: "FS-2026-902",
    order_ref: "FS-2026-902",
    customer_name: "NeuroSynth Audio Labs",
    total_amount: 1450,
    amount_bdt: 174000,
    amount_usd: 1450,
    currency: "USD",
    payment_method: "Stripe Card Checkout",
    payment_status: "paid",
    project_status: "completed",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const FALLBACK_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: "log_1",
    action: "STATUS_TRANSITION",
    event_type: "STATUS_TRANSITION",
    resource_type: "project",
    resource_id: "proj_demo_001",
    actor_email: "ops@freakinstudio.com",
    details: { project: "proj_demo_001", from: "brief_submitted", to: "in_production" },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log_2",
    action: "QUOTE_ISSUED",
    event_type: "QUOTE_ISSUED",
    resource_type: "quote",
    resource_id: "q_demo_882",
    actor_email: "director@freakinstudio.com",
    details: { quote_ref: "QT-2026-882", issued_amount: 2400, currency: "USD" },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log_3",
    action: "SERVICE_PRICE_UPDATED",
    event_type: "SERVICE_PRICE_UPDATED",
    resource_type: "service",
    resource_id: "C05",
    actor_email: "superadmin@freakinstudio.com",
    details: { service_code: "C05", field: "base_bdt", new_value: 20000 },
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default async function AdminPage() {
  const [services, categories] = await Promise.all([
    getAllServices(),
    getAllCategories(),
  ]);

  const supabase = await createClient();

  // Attempt database queries with graceful fallback
  let projects: AdminProject[] = FALLBACK_PROJECTS;
  let quotes: AdminQuote[] = FALLBACK_QUOTES;
  let orders: AdminOrder[] = FALLBACK_ORDERS;
  let auditLogs: AdminAuditLog[] = FALLBACK_AUDIT_LOGS;

  try {
    const [
      { data: dbProjects, error: projErr },
      { data: dbQuotes, error: quoteErr },
      { data: dbOrders, error: orderErr },
      { data: dbAudit, error: auditErr },
    ] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50),
    ]);

    if (!projErr && dbProjects && dbProjects.length > 0) {
      projects = dbProjects.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        revisions_used: p.revisions_used ?? 0,
        max_revisions: p.max_revisions ?? 3,
        current_round: p.revisions_used ?? 0,
        max_rounds: p.max_revisions ?? 3,
        created_at: p.created_at,
      }));
    }
    if (!quoteErr && dbQuotes && dbQuotes.length > 0) {
      quotes = dbQuotes.map((q) => ({
        id: q.id,
        quote_ref: q.quote_ref || q.id,
        status: q.status,
        currency: q.currency,
        amount_bdt: Number(q.amount_bdt ?? 0),
        amount_usd: Number(q.amount_usd ?? 0),
        total_amount: q.currency === "USD" ? Number(q.amount_usd ?? 0) : Number(q.amount_bdt ?? 0),
        notes: q.notes || null,
        created_at: q.created_at,
      }));
    }
    if (!orderErr && dbOrders && dbOrders.length > 0) {
      orders = dbOrders.map((o) => ({
        id: o.id,
        order_ref: o.order_ref || o.id,
        order_number: o.order_ref || o.id,
        amount_bdt: Number(o.amount_bdt ?? (o.currency === "BDT" ? o.amount : Math.round(Number(o.amount ?? 0) * 120))),
        amount_usd: Number(o.amount_usd ?? (o.currency === "USD" ? o.amount : Math.round(Number(o.amount ?? 0) / 120))),
        total_amount: Number(o.amount ?? 0),
        currency: o.currency,
        payment_status: o.payment_status,
        project_status: o.project_status || (o.payment_status === "paid" ? "in_production" : "pending"),
        created_at: o.created_at,
      }));
    }
    if (!auditErr && dbAudit && dbAudit.length > 0) {
      auditLogs = dbAudit.map((a) => ({
        id: a.id,
        event_type: a.event_type,
        action: a.event_type,
        details: a.details,
        actor_id: a.actor_id,
        created_at: a.created_at,
      }));
    }
  } catch (err) {
    // Keep high-fidelity fallbacks
    console.warn("Using fallback admin data due to database read error:", err);
  }

  return (
    <AdminConsoleClient
      initialServices={services}
      categories={categories}
      initialProjects={projects}
      initialQuotes={quotes}
      initialOrders={orders}
      initialAuditLogs={auditLogs}
    />
  );
}
