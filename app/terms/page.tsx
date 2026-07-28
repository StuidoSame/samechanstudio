import type { Metadata } from "next";
import { PolicyPageLayout } from "../components/PolicyPageLayout";
import { createPageMetadata } from "../lib/seo";
import { TermsArchive } from "./TermsArchive";

export const metadata: Metadata = createPageMetadata("terms");

export default function TermsPage() {
  return (
    <PolicyPageLayout page="terms" title="TERMS">
      <TermsArchive />
    </PolicyPageLayout>
  );
}
