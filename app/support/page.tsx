import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPageLayout } from "../components/PolicyPageLayout";
import { SupportContent } from "./SupportContent";
import { SupportHero } from "./SupportHero";

export const metadata: Metadata = { title: "Support — SAME STUDIO" };

export default function SupportPage() {
  return (
    <PolicyPageLayout page="support" title="SUPPORT">
      <section className="archive-document support-document" aria-labelledby="archive-title">
        <SupportHero />
        <div className="archive-document-space support-glass-card">
          <SupportContent />
        </div>
        <Link className="archive-back" href="/">BACK</Link>
      </section>
    </PolicyPageLayout>
  );
}
