import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { DELETE_ACCOUNT_MESSAGES } from "../app/delete-account/deleteAccountMessages.ts";
import { COSMIC_INTRO_TIMELINE_CSS } from "../app/components/cosmic-intro/introTiming.mjs";
import { ko } from "../app/i18n/locales/ko.ts";
import { apps } from "../app/lib/apps.ts";

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
  assert.match(html, /class="site-shell is-ready"/);
  assert.match(html, /class="cosmic-intro" aria-hidden="true"/);
  assert.ok(html.includes(COSMIC_INTRO_TIMELINE_CSS), "SSR supplies the shared six-second CSS clock before hydration");
  const letters = [...html.matchAll(/class="cosmic-intro-letter" style="--cosmic-letter-index:(\d+)" aria-hidden="true">([^<]+)<\/span>/g)];
  assert.deepEqual(letters.map((match) => [Number(match[1]), match[2]]),
    Array.from("SAMESTUDIO", (letter, index) => [index, letter]));
  assert.match(html, /class="cosmic-intro-letter-gap"[^>]*> <\/span>/);
  assert.doesNotMatch(html, /preloader|data-loader-progress|Loading \d+%|site-shell is-loading/);
  assert.match(html, /\/assets\/icons\/Mapary_icon\.png/);
  assert.match(html, /aria-label="Select Pulto"/);
  assert.match(html, /aria-label="Select WAESSEUM"/);
  assert.doesNotMatch(html, /aria-label="Select Runtronome"/);
  assert.doesNotMatch(html, /home-seo-intro|INDEPENDENT APP STUDIO/i);
  assert.doesNotMatch(html, /<h1\b/i);
  assert.doesNotMatch(html, /app-catalog|APP COLLECTION|apps-catalog-title/i);
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

test("icon-first cards preserve app identities and keep shared planetary scenery outside the carousel", async () => {
  const html = await (await render()).text();
  const cards = [...html.matchAll(/<button class="app-card cosmic-app" data-app="([^"]+)"[^>]*aria-label="([^"]+)"[^>]*>(.*?)<\/button>/g)];
  assert.deepEqual(cards.map(([, id, label]) => [id, label]), apps.map(({ id, name }) => [id, `Select ${name}`]));
  for (const [index, [, , , content]] of cards.entries()) {
    assert.match(content, /class="cosmic-icon-frame"><img/);
    assert.ok(content.includes(apps[index].icon.replaceAll("&", "&amp;")));
    assert.doesNotMatch(content, /planet-body|planet-shell|planet-orbit|planet-atmosphere|planet-icon-shadow|cosmic-distant-planet/);
  }
  assert.match(html, /aria-label="Select Mapary" aria-current="true" tabindex="0"/);
  assert.equal((html.match(/class="app-card cosmic-app"[^>]*tabindex="-1"/g) ?? []).length, 6);
  const backdrop = html.match(/<div class="cosmic-showcase-backdrop" aria-hidden="true">(.*?)<\/div>/)?.[1];
  assert.ok(backdrop);
  assert.equal((backdrop.match(/class="cosmic-distant-planet /g) ?? []).length, 2);
  assert.doesNotMatch(backdrop, /<button|<img|data-app/);
  assert.doesNotMatch(html, /planetary-app|planetary-stage|planetary-environment|planetary-orbit-wide|planet-dust/);
  assert.match(html, /aria-label="Previous app"/);
  assert.match(html, /aria-label="Next app"/);
  assert.match(html, /class="view-app-label">VIEW DETAIL/);
});

test("renders the seven-app catalog and TOCOBI without restoring removed app entries", async () => {
  const home = await (await render()).text();
  const jsonLd = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const software = jsonLd["@graph"].filter((item) => item["@type"] === "SoftwareApplication");
  assert.deepEqual(software.map((app) => app.name), [
    "Mapary", "Pulto", "EVRUNE", "TOCOBI", "SKKOO", "Teru Bozu", "WAESSEUM",
  ]);
  assert.equal(software.find((app) => app.name === "TOCOBI").downloadUrl,
    "https://apps.apple.com/kr/app/tocklist/id6782831874");
  for (const name of ["TOCOBI", "SKKOO"]) {
    const app = software.find((candidate) => candidate.name === name);
    assert.equal(app.operatingSystem, "iOS, Android");
    assert.equal(app.sameAs.length, 1, "no unverified Google Play URL is published");
  }
  for (const path of ["/", "/support/", "/privacy/", "/terms/", "/delete-account/"]) {
    const html = path === "/" ? home : await (await render(path)).text();
    // Support may explain ETC's PINI/PEPESNAP inquiry options; its cards are
    // checked separately below so this guidance cannot restore catalog entries.
    const retiredNames = path === "/support/"
      ? /Feeloo|FEELOO|Tocklist|TOCKLIST/
      : /PINI|PEPESNAP|Feeloo|FEELOO|Tocklist|TOCKLIST/;
    assert.doesNotMatch(html, retiredNames, path);
    if (path === "/" || path === "/support/") assert.match(html, /TOCOBI/);
  }
});

test("Support adds ETC after the seven apps without restoring legacy app cards", async () => {
  const html = await (await render("/support/")).text();
  const cards = [...html.matchAll(/class="support-app-icon-button"[^>]*aria-label="([^"]+)"/g)];
  assert.deepEqual(cards.map((match) => match[1]), [
    "Mapary 선택", "Pulto 선택", "EVRUNE 선택", "TOCOBI 선택", "SKKOO 선택", "Teru Bozu 선택", "WAESSEUM 선택", "ETC 선택",
  ]);
  assert.match(html, /class="support-etc-art" aria-hidden="true"/);
  assert.match(html, /mailto:contact@samestudio\.kr\?subject=%5BSAME%20STUDIO%5D%20Support/);
  assert.doesNotMatch(html, /PINI 선택|PEPESNAP 선택|FEELOO 선택|pini_icon|pepsnap\.png|feeloo_icon/);
});

test("binds six world bodies and two constellation planes to the spatial flight renderer", async () => {
  const html = await (await render()).text();
  assert.deepEqual([...html.matchAll(/data-flight-planet="([^"]+)"/g)].map((match) => match[1]),
    ["rocky", "gas", "atmosphere", "ice", "moon", "distant"]);
  assert.deepEqual([...html.matchAll(/data-flight-constellation="([^"]+)"/g)].map((match) => match[1]),
    ["north", "south"]);
  const starCount = [...html.matchAll(/class="cosmic-flight-star"/g)].length;
  assert.ok(starCount > 0 && starCount <= 144, "keep the shared SVG starfield within its DOM budget");
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
      "EVRUNE 등 SAME STUDIO 앱 계정과 연결 데이터의 삭제를 요청하고 처리 절차를 확인할 수 있는 공식 페이지입니다.",
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
    assert.doesNotMatch(html, /class="cosmic-intro"|class="cosmic-intro-scenery"|\/assets\/cosmic-planets\//);
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
  assert.match(html, /개인정보 삭제를 요청하고 싶어요\./);
  assert.equal(
    (html.match(/class="support-faq-item"/g) ?? []).length,
    12,
  );
  let previousQuestion = -1;
  for (const [index, { question, answer }] of ko.support.faq.entries()) {
    const position = html.indexOf(question);
    assert.ok(position > previousQuestion, question);
    previousQuestion = position;
    assert.match(html, new RegExp(`id="support-faq-question-${index}"[^>]*aria-expanded="false" aria-controls="support-faq-panel-${index}"`));
    assert.match(html, new RegExp(`id="support-faq-panel-${index}"[^>]*role="region" aria-labelledby="support-faq-question-${index}" aria-hidden="true"`));
    assert.ok(answer.every((paragraph) => html.includes(paragraph)), question);
  }
  const panels = [...html.matchAll(/class="support-faq-answer"[^>]*><div>(.*?)<\/div>/g)];
  assert.equal(panels.length, 12);
  assert.ok(panels.every(([, content]) => (content.match(/<p>/g) ?? []).length === 6));
  assert.doesNotMatch(html, /도움이 필요한 앱을 선택해주세요\./);
  assert.doesNotMatch(html, /support-app-pill/);
  assert.match(html, /aria-label="Mapary 선택" aria-pressed="true"/);
  for (const iconName of [
    "evrune_icon.png",
    "Mapary_icon.png",
    "pulto_icon.png",
    "tocklist_icon.png",
    "skkoo_icon.png",
    "terubozu_icon.png",
    "waesseum_icon.png",
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
  assert.match(html, />EVRUNE<\/option>/);
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

test("the built intro script executes and ignores development replay parameters", async () => {
  const html = await (await render()).text();
  const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].find(
    (match) => match[1].includes("same-studio-cosmic-intro-v2"),
  );
  assert.ok(script, "intro initialization must be in the server-rendered head");
  assert.ok(html.indexOf(script[0]) < html.indexOf("<body>"));
  const execute = (seen, reducedMotion, pathname = "/", failure = null) => {
    const root = { dataset: {} };
    const document = { documentElement: root, visibilityState: "visible" };
    vm.runInNewContext(script[1], {
      document, URLSearchParams,
      window: {
        document,
        location: { pathname, hash: "", search: "?intro=full" },
        scrollY: 0,
        sessionStorage: { getItem: () => {
          if (failure === "storage") throw new Error("Storage blocked");
          return seen === true ? "1" : typeof seen === "string" ? seen : null;
        } },
        matchMedia: () => {
          if (failure === "initialization") throw new Error("Initialization failed");
          return { matches: reducedMotion };
        },
        performance: { getEntriesByType: () => [{ type: "navigate" }] },
      },
    });
    return root.dataset;
  };
  assert.deepEqual(execute(true, false), {});
  assert.deepEqual(execute(false, true), { cosmicIntro: "true", cosmicIntroMotion: "reduced" });
  assert.deepEqual(execute(false, false), { cosmicIntro: "true", cosmicIntroMotion: "full" });
  for (const pathname of ["/support/", "/privacy/", "/terms/", "/delete-account/"]) {
    assert.deepEqual(execute(false, false, pathname), {});
  }
  for (const stored of ["started", "skipped", "interrupted"]) {
    assert.deepEqual(execute(stored, false), {});
  }
  assert.deepEqual(execute(false, false, "/", "storage"), {});
  assert.deepEqual(execute(false, false, "/", "initialization"), {});
});
