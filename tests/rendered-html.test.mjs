import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

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
        fetch: async () => new Response("Not found", { status: 404 }),
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
  assert.match(html, /<title>SAME STUDIO<\/title>/i);
  assert.match(html, /same-studio-theme-v1/);
  assert.match(html, /SAME STUDIO/);
  assert.match(html, /Mapary_icon\.png/);
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

test("renders policy pages with the shared header, footer, and navigation", async () => {
  const policyPages = [
    ["/support", "SUPPORT"],
    ["/privacy", "PRIVACY"],
    ["/terms", "TERMS"],
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
  const response = await render("/support");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, />CONTACT</);
  assert.match(html, />EMAIL SUPPORT</);
  assert.match(html, /mailto:contact@samestudio\.kr\?subject=/);
  assert.match(html, /aria-label="이메일로 고객지원 문의하기"/);
  assert.match(html, />contact@samestudio\.kr<\/a>/);
  assert.match(html, /body=[^"']*%EC%95%B1%20%EC%9D%B4%EB%A6%84%3A%20Mapary/);
  assert.match(html, /RESPONSE TIME/);
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
