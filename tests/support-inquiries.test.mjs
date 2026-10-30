import assert from "node:assert/strict";
import test from "node:test";
import { apps } from "../app/lib/apps.ts";
import {
  createSupportRequest,
  createSupportCategories,
  ETC_INQUIRY_TYPES,
} from "../app/support/supportInquiries.ts";
import { ko } from "../app/i18n/locales/ko.ts";
import { en } from "../app/i18n/locales/en.ts";
import { ja } from "../app/i18n/locales/ja.ts";
import { zhCN } from "../app/i18n/locales/zh-CN.ts";
import { zhTW } from "../app/i18n/locales/zh-TW.ts";

const copies = [ko, en, ja, zhCN, zhTW].map(({ support }) => support);
const SUPPORT_CATEGORIES = createSupportCategories(apps);
const etc = SUPPORT_CATEGORIES.at(-1);
const parseEmail = ({ emailHref }) => {
  const url = new URL(emailHref);
  assert.equal(url.protocol, "mailto:");
  assert.equal(url.pathname, "contact@samestudio.kr");
  return { subject: url.searchParams.get("subject"), body: url.searchParams.get("body") };
};

test("common Korean FAQ follows the twelve requested support topics in order", () => {
  assert.deepEqual(ko.support.faq.map(({ question }) => question), [
    "앱이 실행되지 않거나 바로 종료돼요.",
    "앱에서 저장한 데이터가 보이지 않아요.",
    "구매한 프리미엄 기능을 복원하고 싶어요.",
    "결제했는데 프리미엄 기능이 적용되지 않아요.",
    "다른 기기로 데이터를 옮기고 싶어요.",
    "알림이 오지 않아요.",
    "사진이나 데이터가 저장되지 않아요.",
    "개인정보 삭제를 요청하고 싶어요.",
    "광고 제거 구매가 적용되지 않아요.",
    "앱 사용 방법이나 기능이 궁금해요.",
    "새로운 기능을 제안하고 싶어요.",
    "문의를 보냈는데 답변은 언제 받을 수 있나요?",
  ]);
});

test("all five FAQ catalogs provide matching complete guidance without Korean fallback", () => {
  for (const [locale, messages] of Object.entries({ ko, en, ja, zhCN, zhTW })) {
    const items = messages.support.faq;
    assert.equal(items.length, 12, locale);
    assert.equal(new Set(items.map(({ question }) => question)).size, 12, locale);
    for (const [index, { question, answer }] of items.entries()) {
      assert.ok(question.trim().length > 5, `${locale}.${index}.question`);
      assert.ok(answer.length >= 5 && answer.length <= 10, `${locale}.${index}.answer`);
      assert.equal(answer.length, ko.support.faq[index].answer.length, `${locale}.${index}.meaning units`);
      assert.equal(new Set(answer).size, answer.length, `${locale}.${index}.duplicate paragraphs`);
      for (const paragraph of answer) {
        assert.ok(paragraph.trim().length >= 10, `${locale}.${index}.empty guidance`);
        if (locale !== "ko") assert.doesNotMatch(paragraph, /[가-힣]/, `${locale}.${index}.fallback`);
      }
    }
  }
});

test("ETC follows the unchanged showcase order without promoting legacy apps", () => {
  assert.deepEqual(SUPPORT_CATEGORIES.map(({ id }) => id), [...apps.map(({ id }) => id), "etc"]);
  assert.deepEqual(ETC_INQUIRY_TYPES, ["pini", "pepesnap", "other"]);
  for (const id of ["pini", "pepesnap", "feeloo", "etc"]) {
    assert.equal(apps.some((app) => app.id === id), false);
  }
  assert.equal(SUPPORT_CATEGORIES.some(({ id }) => ["pini", "pepesnap", "feeloo"].includes(id)), false);
});

test("existing app inquiries keep their subject, recipient and localized message template", () => {
  for (const support of copies) {
    for (const app of apps) {
      const request = createSupportRequest(SUPPORT_CATEGORIES.find(({ id }) => id === app.id), "pini", support);
      assert.equal(request.inquiryName, app.name);
      assert.deepEqual(parseEmail(request), {
        subject: support.email.subject,
        body: support.email.body.replaceAll("{app}", app.name),
      });
    }
  }
});

test("legacy app inquiries are identified separately in both subject and body in every language", () => {
  for (const support of copies) {
    for (const type of ["pini", "pepesnap"]) {
      const request = createSupportRequest(etc, type, support);
      const name = type.toUpperCase();
      assert.equal(request.inquiryName, name);
      assert.deepEqual(parseEmail(request), {
        subject: `[SAME STUDIO] ${name} Support`,
        body: support.email.body.replaceAll("{app}", name),
      });
    }
  }
});

test("Other uses a general inquiry subject and a localized, complete body", () => {
  for (const support of copies) {
    assert.ok(support.etc.inquiryType.trim());
    assert.ok(support.etc.description.trim());
    assert.match(support.etc.other, /Other/);
    const request = createSupportRequest(etc, "other", support);
    assert.equal(request.inquiryName, support.etc.other);
    const email = parseEmail(request);
    assert.equal(email.subject, "[SAME STUDIO] General Inquiry");
    assert.equal(email.body, support.email.body.replaceAll("{app}", support.etc.other));
    assert.doesNotMatch(email.body, /\{app\}|PINI|PEPESNAP|FEELOO/);
  }
});
