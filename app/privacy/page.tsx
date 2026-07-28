import type { Metadata } from "next";
import { PolicyPageLayout } from "../components/PolicyPageLayout";
import { createPageMetadata } from "../lib/seo";
import { PrivacyArchive } from "./PrivacyArchive";

export const metadata: Metadata = createPageMetadata("privacy");

export default function PrivacyPage() {
  return (
    <PolicyPageLayout page="privacy" title="PRIVACY">
      <PrivacyArchive />
    </PolicyPageLayout>
  );
}
