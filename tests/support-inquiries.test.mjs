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
