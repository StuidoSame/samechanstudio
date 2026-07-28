import type { Metadata } from "next";
import { PolicyPageLayout } from "../components/PolicyPageLayout";
import { PrivacyArchive } from "./PrivacyArchive";

export const metadata: Metadata = { title: "Privacy — SAME STUDIO" };

export default function PrivacyPage() {
  return (
    <PolicyPageLayout page="privacy" title="PRIVACY">
      <PrivacyArchive />
    </PolicyPageLayout>
  );
}
