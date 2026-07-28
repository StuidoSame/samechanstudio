import type { Metadata } from "next";
import { PolicyPageLayout } from "../components/PolicyPageLayout";
import { DeleteAccountContent } from "./DeleteAccountContent";
import "./delete-account.css";

export const metadata: Metadata = {
  title: "계정 및 데이터 삭제 | SAME STUDIO",
  description: "SAME STUDIO 앱 계정과 연결 데이터의 삭제를 요청하는 공식 페이지입니다.",
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
