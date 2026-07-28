import type { Metadata } from "next";
import { PolicyPageLayout } from "../components/PolicyPageLayout";
import { createPageMetadata } from "../lib/seo";
import { DeleteAccountContent } from "./DeleteAccountContent";
import "./delete-account.css";

export const metadata: Metadata = createPageMetadata("delete-account");

export default function DeleteAccountPage() {
  return (
    <PolicyPageLayout page="delete-account" title="DELETE ACCOUNT">
      <DeleteAccountContent />
    </PolicyPageLayout>
  );
}
