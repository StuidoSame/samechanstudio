import type { Metadata } from "next";
import { PolicyPageLayout } from "../components/PolicyPageLayout";
import { TermsArchive } from "./TermsArchive";

export const metadata: Metadata = { title: "Terms — SAME STUDIO" };

export default function TermsPage() {
  return (
    <PolicyPageLayout page="terms" title="TERMS">
      <TermsArchive />
    </PolicyPageLayout>
  );
}
