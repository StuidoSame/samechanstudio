import type { Metadata } from "next";
import { PolicyPageLayout } from "../components/PolicyPageLayout";
import { DeleteAccountContent } from "./DeleteAccountContent";
import { DELETE_ACCOUNT_MESSAGES } from "./deleteAccountMessages";
import "./delete-account.css";

export const metadata: Metadata = {
  title: DELETE_ACCOUNT_MESSAGES.en.metadataTitle,
  description: DELETE_ACCOUNT_MESSAGES.en.metadataDescription,
  robots: { index: true, follow: true },
  alternates: { canonical: "https://samestudio.kr/delete-account/" },
};

export default function DeleteAccountPage() {
  return (
    <PolicyPageLayout page="delete-account" title="DELETE ACCOUNT">
      <DeleteAccountContent />
    </PolicyPageLayout>
  );
}
