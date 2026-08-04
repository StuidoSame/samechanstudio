import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { DELETE_ACCOUNT_MESSAGES } from "../app/delete-account/deleteAccountMessages.ts";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const assetPath = new URL(request.url).pathname;
          if (assetPath.includes("..")) {
            return new Response("Not found", { status: 404 });
          }

          try {
            const body = await readFile(
              new URL(`../dist/client${assetPath}`, import.meta.url),
            );
            const contentType = assetPath.endsWith(".xml")
              ? "application/xml; charset=utf-8"
              : assetPath.endsWith(".txt")
                ? "text/plain; charset=utf-8"
                : assetPath.endsWith(".webmanifest")
                  ? "application/manifest+json; charset=utf-8"
                  : "application/octet-stream";
            return new Response(body, {
              status: 200,
              headers: { "content-type": contentType },
            });
          } catch {
            return new Response("Not found", { status: 404 });
          }
        },
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the SAME STUDIO app explorer", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html[^>]*lang="ko"/i);
  assert.match(
    html,
    /<title>SAME STUDIO \| iOS·Android 인디 앱 개발 스튜디오<\/title>/i,
  );
  assert.match(html, /same-studio-theme-v1/);
  assert.match(html, /same-studio-font-size/);
  assert.match(html, /aria-controls="font-size-panel"/);
  assert.match(html, /SAME STUDIO/);
  assert.match(html, /Mapary_icon\.png/);
  assert.doesNotMatch(html, /home-seo-intro|INDEPENDENT APP STUDIO/i);
  assert.doesNotMatch(html, /<h1\b/i);
  assert.equal((html.match(/class="app-catalog-card"/g) ?? []).length, 9);
  assert.match(html, /지도 메모 앱/);
  assert.match(html, /러닝 메트로놈 앱/);
  assert.match(html, /하루 질문 기록 앱/);
  assert.match(html, /Lacaunt\(LOCAUNT\)/);
  assert.match(html, /사진 미션 앱/);
  assert.match(html, /24시간 투두 앱/);
  assert.match(html, /다꾸 앱이자 디지털 다이어리/);
  assert.match(html, /날씨 소원 앱/);
  assert.match(html, /감정 위젯 앱/);
  assert.match(html, /Mapary[\s\S]{0,80}App Store에서 보기/);
  assert.match(html, /Mapary[\s\S]{0,80}Google Play에서 보기/);
  assert.match(html, /type="application\/ld\+json"/);
  assert.match(html, /"@type":"Organization"/);
  assert.match(html, /"@type":"WebSite"/);
  assert.match(html, /"@type":"SoftwareApplication"/);
  const structuredData = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(structuredData);
  const jsonLd = JSON.parse(structuredData[1]);
  assert.equal(jsonLd["@context"], "https://schema.org");
  assert.ok(jsonLd["@graph"].some((item) => item["@type"] === "Organization"));
  assert.match(
    html,
    /rel="manifest" href="https:\/\/samestudio\.kr\/site\.webmanifest"/,
  );
  assert.match(html, /rel="apple-touch-icon"/);
  assert.doesNotMatch(html, /\/og\.png/);
  assert.match(html, /페이지 주요 섹션 이동/);
  assert.match(html, /contact@samestudio\.kr/);
  assert.match(html, /watch-hit-counter/);
  assert.match(html, />00<\/span><span[^>]*>HITS<\/span>/);
  assert.doesNotMatch(
    html,
    /Rhythm recording controls|Record rhythm|Stop recording|Play recorded rhythm|Clear recorded rhythm|Mute drums/,
  );
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders unique page metadata, canonical URLs, and social cards", async () => {
  const pages = [
    [
      "/",
      "SAME STUDIO | iOS·Android 인디 앱 개발 스튜디오",
      "SAME STUDIO는 지도 메모, 러닝 메트로놈, 하루 질문 기록, 다꾸 등 일상에 도움이 되는 iOS·Android 앱을 제작하는 인디 앱 개발 스튜디오입니다.",
      "https://samestudio.kr/",
    ],
    [
      "/support/",
      "앱 고객지원 및 문의 | SAME STUDIO",
      "SAME STUDIO 앱의 이용 방법, 오류, 결제, 계정 및 개인정보 관련 문의를 확인하고 고객지원 요청을 보낼 수 있습니다.",
      "https://samestudio.kr/support/",
    ],
    [
      "/privacy/",
      "개인정보처리방침 | SAME STUDIO",
      "SAME STUDIO 앱과 서비스에서 처리하는 개인정보, 이용 목적, 권한, 외부 서비스, 보관 및 삭제 기준을 안내합니다.",
      "https://samestudio.kr/privacy/",
    ],
    [
      "/terms/",
      "서비스 이용약관 | SAME STUDIO",
      "SAME STUDIO 앱과 웹사이트 이용에 적용되는 서비스 이용 조건, 사용자 책임, 결제, 콘텐츠 및 안전 관련 약관을 안내합니다.",
      "https://samestudio.kr/terms/",
    ],
    [
      "/delete-account/",
      "계정 및 데이터 삭제 요청 | SAME STUDIO",
      "ODOW 등 SAME STUDIO 앱 계정과 연결 데이터의 삭제를 요청하고 처리 절차를 확인할 수 있는 공식 페이지입니다.",
      "https://samestudio.kr/delete-account/",
    ],
  ];
  const titles = new Set();

  for (const [pathname, title, description, canonical] of pages) {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    const html = await response.text();

    assert.ok(html.includes(`<title>${title}</title>`));
    assert.ok(html.includes(`<meta name="description" content="${description}"`));
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}"`));
    assert.ok(html.includes(`<meta property="og:title" content="${title}"`));
    assert.ok(html.includes(`<meta property="og:description" content="${description}"`));
    assert.ok(html.includes(`<meta property="og:url" content="${canonical}"`));
    assert.ok(html.includes('<meta property="og:site_name" content="SAME STUDIO"'));
    assert.ok(html.includes('<meta property="og:locale" content="ko_KR"'));
    assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image"'));
    assert.ok(html.includes('<meta name="robots" content="index, follow'));
    assert.doesNotMatch(html, /hreflang=/i);
    assert.equal(
      (html.match(/<h1\b/gi) ?? []).length,
      pathname === "/" ? 0 : 1,
      pathname,
    );
    titles.add(title);
  }

  assert.equal(titles.size, pages.length, "every route should have a unique title");
});

test("builds crawlable robots, sitemap, and manifest assets", async () => {
  const readBuiltAsset = (pathname) =>
    readFile(new URL(`../dist/client${pathname}`, import.meta.url), "utf8");

  const robots = await readBuiltAsset("/robots.txt");
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/samestudio\.kr\/sitemap\.xml/);

  const sitemap = await readBuiltAsset("/sitemap.xml");
  const sitemapPaths = ["/", "/support/", "/privacy/", "/terms/", "/delete-account/"];
  for (const pathname of sitemapPaths) {
    assert.ok(sitemap.includes(`<loc>https://samestudio.kr${pathname}</loc>`));
    assert.equal((await render(pathname)).status, 200, pathname);
  }

  const manifest = JSON.parse(await readBuiltAsset("/site.webmanifest"));
  assert.equal(manifest.name, "SAME STUDIO");
  assert.equal(manifest.start_url, "/");
  assert.ok(manifest.icons.some((icon) => icon.src === "/assets/favicon/favicon.ico"));
});

test("renders policy pages with the shared header, footer, and navigation", async () => {
  const policyPages = [
    ["/support/", "SUPPORT"],
    ["/privacy/", "PRIVACY"],
    ["/terms/", "TERMS"],
  ];

  for (const [pathname, title] of policyPages) {
    const response = await render(pathname);
    assert.equal(response.status, 200);
    const html = await response.text();

    assert.match(html, new RegExp(`<h1[^>]*>${title}</h1>`, "i"));
    assert.match(html, /aria-label="SAME STUDIO home"/i);
    assert.match(html, /aria-label="Footer navigation"/i);
    assert.match(html, />SUPPORT</i);
    assert.match(html, />HOME</i);
    assert.match(html, />PRIVACY</i);
    assert.match(html, />TERMS</i);
    assert.doesNotMatch(html, /RETURN TO SAME STUDIO|SAME STUDIO ARCHIVE/);
  }
});

test("server-renders the SUPPORT contact flow and FAQ", async () => {
  const response = await render("/support/");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, />문의 앱 선택</);
  assert.match(html, />고객지원 센터</);
  assert.match(html, /SAME STUDIO 앱 사용 중 문제가 있거나/);
  assert.match(html, /도움이 필요하다면 아래에서 문의해주세요\./);
  assert.match(html, />이메일 문의</);
  assert.match(html, /mailto:contact@samestudio\.kr\?subject=/);
  assert.match(html, /aria-label="이메일로 고객지원 문의하기"/);
  assert.match(html, />contact@samestudio\.kr<\/a>/);
  assert.match(html, /body=[^"']*%EC%95%B1%20%EC%9D%B4%EB%A6%84%3A%20Mapary/);
  assert.match(html, />답변 안내</);
  assert.match(html, /앱에서 오류가 발생했어요\./);
  assert.match(html, /개인정보 삭제를 요청하고 싶어요\./);
  assert.equal(
    (html.match(/class="support-faq-item"/g) ?? []).length,
    10,
  );
  for (const question of [
    "구매한 항목을 복원하고 싶어요.",
    "앱이 실행되지 않거나 바로 종료돼요.",
    "알림이 오지 않아요.",
    "사진이나 데이터가 저장되지 않아요.",
    "다른 기기로 데이터를 옮기고 싶어요.",
    "광고 제거 구매가 적용되지 않아요.",
    "앱 사용 방법이나 기능이 궁금해요.",
    "새로운 기능을 제안하고 싶어요.",
  ]) {
    assert.ok(html.includes(question));
  }
  assert.doesNotMatch(html, /도움이 필요한 앱을 선택해주세요\./);
  assert.doesNotMatch(html, /support-app-pill/);
  assert.match(html, /aria-label="Mapary 선택" aria-pressed="true"/);
  for (const iconName of [
    "ODOW_icon.png",
    "Mapary_icon.png",
    "Locaunt_icon.png",
    "Runtronome_icon.png",
    "pepesnap_icon.png",
    "tocklist_icon.png",
    "skkoo_icon.png",
    "terubozu_icon.png",
    "waesseum_icon.png",
    "feeloo_icon.png",
  ]) {
    assert.match(html, new RegExp(iconName.replace(".", "\\.")));
  }
});

test("server-renders the public account deletion request page", async () => {
  const response = await render("/delete-account/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>계정 및 데이터 삭제 요청 \| SAME STUDIO<\/title>/i);
  assert.match(html, /<h1[^>]*>계정 및 데이터 삭제<\/h1>/i);
  assert.match(html, /SAME STUDIO/);
  assert.match(html, />ODOW<\/option>/);
  assert.match(html, /id="deletion-email"[^>]*type="email"/i);
  assert.match(html, /id="deletion-login"/i);
  assert.match(html, /type="checkbox"/i);
  assert.match(html, /mailto:contact@samestudio\.kr/i);
  assert.match(html, /href="\/privacy\/"/i);
  assert.match(html, /href="\/support\/"/i);
  assert.match(html, /href="\/delete-account\/"[^>]*>DELETE ACCOUNT<\/a>/i);
  assert.doesNotMatch(html, /type="password"/i);
  assert.doesNotMatch(html, /Coming Soon/i);

  const menu = html.match(/<nav id="site-menu"[\s\S]*?<\/nav>/i)?.[0] ?? "";
  assert.ok(menu, "the shared hamburger menu should be rendered");
  assert.doesNotMatch(menu, /DELETE ACCOUNT/i);
});

test("localizes every account-deletion validation and status message", () => {
  const locales = ["ko", "en", "ja", "zh-CN", "zh-TW"];
  const collectStrings = (value) =>
    typeof value === "string"
      ? [value]
      : Array.isArray(value)
        ? value.flatMap(collectStrings)
        : value && typeof value === "object"
          ? Object.values(value).flatMap(collectStrings)
          : [];

  for (const locale of locales) {
    const messages = DELETE_ACCOUNT_MESSAGES[locale];
    assert.ok(messages.metadataTitle);
    assert.ok(messages.metadataDescription);
    assert.ok(messages.form.submitting);
    assert.ok(messages.form.errors.required);
    assert.ok(messages.form.errors.submitFailed);
    assert.ok(messages.form.errors.retry);
  }

  for (const locale of locales.slice(1)) {
    const leakedKorean = collectStrings(DELETE_ACCOUNT_MESSAGES[locale]).filter(
      (value) => /[가-힣]/.test(value),
    );
    assert.deepEqual(leakedKorean, [], `${locale} must not contain Korean copy`);
  }
});

test("initializes the pre-hydration theme from saved choice or dark", async () => {
  const response = await render();
  const html = await response.text();
  const scriptMatch = html.match(
    /<script>([\s\S]*?same-studio-theme-v1[\s\S]*?)<\/script>/,
  );

  assert.ok(scriptMatch, "theme initialization script should be rendered");
  assert.ok(
    html.indexOf(scriptMatch[0]) < html.indexOf("<body>"),
    "theme initialization should run before body rendering",
  );
  assert.doesNotMatch(scriptMatch[1], /prefers-color-scheme|matchMedia/);

  const executeThemeScript = (storedTheme, storageThrows = false) => {
    const root = { dataset: {}, style: {} };
    let themeColor = "#191522";

    vm.runInNewContext(scriptMatch[1], {
      document: {
        documentElement: root,
        querySelector: () => ({
          setAttribute: (name, value) => {
            if (name === "content") themeColor = value;
          },
        }),
      },
      window: {
        localStorage: {
          getItem: () => {
            if (storageThrows) throw new Error("Storage unavailable");
            return storedTheme;
          },
        },
      },
    });

    return {
      theme: root.dataset.theme,
      colorScheme: root.style.colorScheme,
      themeColor,
    };
  };

  assert.deepEqual(executeThemeScript(null), {
    theme: "dark",
    colorScheme: "dark",
    themeColor: "#191522",
  });
  assert.deepEqual(executeThemeScript("invalid-theme"), {
    theme: "dark",
    colorScheme: "dark",
    themeColor: "#191522",
  });
  assert.deepEqual(executeThemeScript("dark"), {
    theme: "dark",
    colorScheme: "dark",
    themeColor: "#191522",
  });
  assert.deepEqual(executeThemeScript("light"), {
    theme: "light",
    colorScheme: "light",
    themeColor: "#f3eeff",
  });
  assert.deepEqual(executeThemeScript(null, true), {
    theme: "dark",
    colorScheme: "dark",
    themeColor: "#191522",
  });
});

test("initializes and validates the saved font size before hydration", async () => {
  const response = await render();
  const html = await response.text();
  const scriptMatch = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].find(
    (match) => match[1].includes("same-studio-font-size"),
  );

  assert.ok(scriptMatch, "font size initialization script should be rendered");
  assert.ok(
    html.indexOf(scriptMatch[0]) < html.indexOf("<body>"),
    "font size initialization should run before body rendering",
  );

  const executeFontSizeScript = (storedFontSize, storageThrows = false) => {
    const root = { dataset: {} };
    const persistedValues = [];

    vm.runInNewContext(scriptMatch[1], {
      document: { documentElement: root },
      window: {
        localStorage: {
          getItem: () => {
            if (storageThrows) throw new Error("Storage unavailable");
            return storedFontSize;
          },
          setItem: (_key, value) => persistedValues.push(value),
        },
      },
    });

    return { fontSize: root.dataset.fontSize, persistedValues };
  };

  assert.deepEqual(executeFontSizeScript(null), {
    fontSize: "medium",
    persistedValues: [],
  });
  assert.deepEqual(executeFontSizeScript("small"), {
    fontSize: "small",
    persistedValues: [],
  });
  assert.deepEqual(executeFontSizeScript("large"), {
    fontSize: "large",
    persistedValues: [],
  });
  assert.deepEqual(executeFontSizeScript("invalid-size"), {
    fontSize: "medium",
    persistedValues: ["medium"],
  });
  assert.deepEqual(executeFontSizeScript(null, true), {
    fontSize: "medium",
    persistedValues: [],
  });
});
