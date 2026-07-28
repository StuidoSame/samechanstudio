import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPageLayout } from "../components/PolicyPageLayout";
import { SupportContent } from "./SupportContent";

export const metadata: Metadata = { title: "Support — SAME STUDIO" };

export default function SupportPage() {
  return (
    <PolicyPageLayout page="support" title="SUPPORT">
      <section className="archive-document support-document" aria-labelledby="archive-title">
        <div className="support-hero">
          <div className="support-hero-label">
            <span className="support-hero-index">01</span>
            <span>SUPPORT CENTER</span>
            <span className="support-hero-line" aria-hidden="true" />
          </div>
          <h1 id="archive-title">SUPPORT</h1>
          <p className="support-hero-description">
            SAME STUDIO 앱 사용 중 문제가 있거나<br />
            도움이 필요하다면 아래에서 문의해주세요.
          </p>
          <span className="support-hero-decoration" aria-hidden="true">
            <i className="support-hero-orbit" />
            <i className="support-hero-star support-hero-star--one" />
            <i className="support-hero-star support-hero-star--two" />
            <i className="support-hero-star support-hero-star--three" />
          </span>
        </div>
        <div className="archive-document-space support-glass-card">
          <SupportContent />
        </div>
        <Link className="archive-back" href="/">BACK</Link>
      </section>
    </PolicyPageLayout>
  );
}
