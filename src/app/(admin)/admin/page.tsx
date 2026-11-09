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
const FALLBACK_PROJECTS = [
  {
    id: "proj_demo_001",
    title: "Apex Robotics — Complete Brand Identity & Motion System",
    client_name: "Apex Autonomous Corp",
    client_email: "brand@apexrobotics.ai",
    status: "in_production",
    current_round: 1,
    max_rounds: 3,
    package_name: "Brand Master System + 3D Kinetic Pack",
    total_amount: 85000,
    currency: "BDT",
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    brief: {
      brand_name: "Apex Robotics",
      deliverable_format: "Vector SVG, 4K ProRes 4444, Design Token Tokens",
      color_palette: "Obsidian Black, Kinetic Neon, Electric Cyan",
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
        file_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
        asset_type: "raster_preview",
        annotations_count: 2,
      },
    ],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "proj_demo_002",
    title: "FinPulse — Mobile App UI & Kinetic Design System",
    client_name: "FinPulse Global Ltd",
    client_email: "growth@finpulse.io",
    status: "client_review",
    current_round: 1,
    max_rounds: 3,
    package_name: "Fintech Mobile Core UI + Interactive Prototyping",
    total_amount: 110000,
    currency: "BDT",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    brief: {
      brand_name: "FinPulse",
      deliverable_format: "Figma Tokens, Design Tokens JSON, High-fidelity prototype",
      color_palette: "Deep Navy, Emerald Accent, Crisp White",
      notes: "Cross-platform mobile banking and wealth management application.",
    },
    tasks: [
      { id: "task_4", title: "Wireframes & Information Architecture", status: "completed" },
      { id: "task_5", title: "High-Fidelity Screens (42 Screens)", status: "completed" },
      { id: "task_6", title: "Client Review & Feedback Stage", status: "in_progress" },
    ],
    assets: [
      {
        id: "asset_2",
        title: "Screen Flow Dashboard Preview",
        version: "v1.2",
        file_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
        asset_type: "raster_preview",
        annotations_count: 3,
      },
    ],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "proj_demo_003",
    title: "NeuroSynth — Sound Design & 3D Spatial Audio Suite",
    client_name: "NeuroSynth Audio Labs",
    client_email: "studio@neurosynth.de",
    status: "completed",
    current_round: 2,
    max_rounds: 3,
    package_name: "Full Brand Sound Identity & 3D Soundscape",
    total_amount: 1450,
    currency: "USD",
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    brief: {
      brand_name: "NeuroSynth",
      deliverable_format: "24-bit 96kHz WAV, Dolby Atmos MP4, MIDI Stems",
      color_palette: "N/A",
      notes: "Sonic logo and atmospheric brand audio for immersive AI hardware product.",
    },
    tasks: [
      { id: "task_7", title: "Sonic Brand Signature", status: "completed" },
      { id: "task_8", title: "Product Interaction Haptics & Chimes", status: "completed" },
      { id: "task_9", title: "Final Master Delivery & Buyout Agreement", status: "completed" },
    ],
    assets: [
      {
        id: "asset_3",
        title: "Sonic Signature Waveform Master",
        version: "v2.0-final",
        file_url: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
        asset_type: "raster_preview",
        annotations_count: 0,
      },
    ],
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const FALLBACK_QUOTES = [
  {
    id: "q_demo_881",
    customer_name: "Synthetix Labs",
    customer_email: "procurement@synthetix.org",
    service_names: ["A1. Enterprise Brand Identity System", "F1. 3D Cinematic Motion Reveal"],
    scope_summary: "Complete corporate identity + 60s 3D motion trailer for token launch.",
    total_amount: 195000,
    currency: "BDT",
    rush_delivery: true,
    status: "pending",
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "q_demo_882",
    customer_name: "Kinetix Sports",
    customer_email: "hello@kinetixsports.com",
    service_names: ["C1. Next.js High-Performance Marketing Web Platform"],
    scope_summary: "High-speed headless e-commerce store with 3D product visualizer.",
    total_amount: 2400,
    currency: "USD",
    rush_delivery: false,
    status: "issued",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const FALLBACK_ORDERS = [
  {
    id: "ord_demo_901",
    order_number: "FS-2026-901",
    customer_name: "Apex Autonomous Corp",
    total_amount: 85000,
    currency: "BDT",
    payment_method: "bKash Merchant Pay",
    payment_status: "paid",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ord_demo_902",
    order_number: "FS-2026-902",
    customer_name: "NeuroSynth Audio Labs",
    total_amount: 1450,
    currency: "USD",
    payment_method: "Stripe Card Checkout",
    payment_status: "paid",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const FALLBACK_AUDIT_LOGS = [
  {
    id: "log_1",
    action: "STATUS_TRANSITION",
    resource_type: "project",
    resource_id: "proj_demo_001",
    actor_email: "ops@freakinstudio.com",
    details: { from: "brief_submitted", to: "in_production" },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log_2",
    action: "QUOTE_ISSUED",
    resource_type: "quote",
    resource_id: "q_demo_882",
    actor_email: "director@freakinstudio.com",
    details: { issued_amount: 2400, currency: "USD" },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log_3",
    action: "SERVICE_PRICE_UPDATED",
    resource_type: "service",
    resource_id: "srv_c1",
    actor_email: "superadmin@freakinstudio.com",
    details: { service_code: "C1", field: "base_price_bdt", new_value: 65000 },
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
        current_round: p.revisions_used,
        max_rounds: p.max_revisions,
        created_at: p.created_at,
      }));
    }
    if (!quoteErr && dbQuotes && dbQuotes.length > 0) {
      quotes = dbQuotes.map((q) => ({
        id: q.id,
        quote_ref: q.quote_ref,
        status: q.status,
        currency: q.currency,
        total_amount: q.currency === "USD" ? q.amount_usd : q.amount_bdt,
        created_at: q.created_at,
      }));
    }
    if (!orderErr && dbOrders && dbOrders.length > 0) {
      orders = dbOrders.map((o) => ({
        id: o.id,
        order_ref: o.order_ref,
        total_amount: o.amount,
        currency: o.currency,
        payment_status: o.payment_status,
        created_at: o.created_at,
      }));
    }
    if (!auditErr && dbAudit && dbAudit.length > 0) {
      auditLogs = dbAudit.map((a) => ({
        id: a.id,
        event_type: a.event_type,
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
