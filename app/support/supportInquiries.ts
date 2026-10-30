import type { AppItem } from "../lib/apps";
import type { TranslationMessages } from "../i18n/types.ts";

// Support can serve inquiries beyond the apps promoted on the home page.
export function createSupportCategories(apps: readonly AppItem[]) {
  return [
    ...apps.map(({ id, name, icon }) => ({ id, name, icon, kind: "app" as const })),
    { id: "etc", name: "ETC", kind: "etc" as const },
  ];
}

type SupportCategory = ReturnType<typeof createSupportCategories>[number];

export const ETC_INQUIRY_TYPES = ["pini", "pepesnap", "other"] as const;
export type EtcInquiryType = (typeof ETC_INQUIRY_TYPES)[number];

export function createSupportRequest(
  category: SupportCategory,
  inquiryType: EtcInquiryType,
  support: TranslationMessages["support"],
) {
  const inquiryName = category.kind !== "etc"
    ? category.name
    : inquiryType === "pini"
      ? "PINI"
      : inquiryType === "pepesnap"
        ? "PEPESNAP"
        : support.etc.other;
  const subject = category.kind !== "etc"
    ? support.email.subject
    : inquiryType === "other"
      ? "[SAME STUDIO] General Inquiry"
      : `[SAME STUDIO] ${inquiryName} Support`;
  const body = support.email.body.replaceAll("{app}", inquiryName);

  return {
    inquiryName,
    emailHref: `mailto:contact@samestudio.kr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}
