import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
