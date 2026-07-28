import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPageLayout } from "../components/PolicyPageLayout";

export const metadata: Metadata = { title: "Support — SAME STUDIO" };

export default function SupportPage() {
  return (
    <PolicyPageLayout page="support" title="SUPPORT">
      <section className="archive-document" aria-labelledby="archive-title">
        <h1 id="archive-title">SUPPORT</h1>
        <div className="archive-document-space"><span className="archive-placeholder">Preparing archive...</span></div>
        <Link className="archive-back" href="/">BACK</Link>
      </section>
    </PolicyPageLayout>
  );
}
