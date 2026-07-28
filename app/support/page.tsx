import type { Metadata } from "next";
import { PolicyPageLayout } from "../components/PolicyPageLayout";
import { InternalTransitionLink } from "../navigation/InternalTransitionLink";
import { SupportContent } from "./SupportContent";
import { SupportCosmosBackground } from "./SupportCosmosBackground";
import { SupportHero } from "./SupportHero";

export const metadata: Metadata = { title: "Support — SAME STUDIO" };

export default function SupportPage() {
  return (
    <PolicyPageLayout page="support" title="SUPPORT">
      <section className="archive-document support-document" aria-labelledby="archive-title">
        <SupportCosmosBackground />
        <SupportHero />
        <div className="archive-document-space support-glass-card">
          <SupportContent />
        </div>
        <InternalTransitionLink className="archive-back" href="/">BACK</InternalTransitionLink>
      </section>
    </PolicyPageLayout>
  );
}
