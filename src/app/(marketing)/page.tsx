import type { Metadata } from "next";
import { CreativeOfficeOS } from "@/features/creative-office/creative-office-os";

export const metadata: Metadata = {
  title:
    "Freakin's Studio — Creative Office OS 2.0 | DESIGN. CREATE. PRODUCE. GROW.",
  description:
    "Explore 6 zero-login local browser creative utilities, 5 Puter-free sponsored Studio AI assistants, 3 AI micro-kits (৳49/৳99/৳199), and 13 hourly-scoped human creative services across 4 disciplines.",
};

export const instant = false;

export default function HomePage() {
  return <CreativeOfficeOS initialRoute="home" />;
}
