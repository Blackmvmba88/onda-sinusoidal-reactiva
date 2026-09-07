import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the Onda Sinusoidal catalog", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Onda Sinusoidal/i);
  assert.match(html, /VGE Engine/);
  assert.match(html, /Abrir y ejecutar/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("renders the first executable project", async () => {
  const response = await render("/projects/ondasinu");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Estado.*dinámica.*costo/is);
  assert.match(html, /Ejecutar simulación/);
  assert.match(html, /Compatibilidad con el catálogo/);
});
