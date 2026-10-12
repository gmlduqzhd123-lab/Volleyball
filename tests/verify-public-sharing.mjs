import { chromium } from "@playwright/test";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";

const url = "https://gmlduqzhd123-lab.github.io/Volleyball/";
const browser = await chromium.launch();
const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
const page = await context.newPage();
const report = { date: new Date().toISOString(), environment: `Windows Playwright Chromium ${browser.version()}`, url, checks: {} };
try {
  await page.goto(url);
  await page.locator(".share-install > details > summary").click();
  await page.getByAltText("우리 모두 배구왕 공개 사이트 QR코드").waitFor();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("link", { name: "QR 이미지 저장" }).click();
  const download = await downloadEvent;
  const png = PNG.sync.read(await readFile(await download.path()));
  assert.equal(jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data, url);
  report.checks.qr = { decoded: url, downloaded: download.suggestedFilename(), width: png.width };
  await page.getByRole("button", { name: "링크 복사" }).click();
  await page.getByText("링크를 복사했어요.", { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => navigator.clipboard.readText()), url);
  report.checks.clipboard = "actual write/read match";
  await page.getByRole("link", { name: "QR코드의 공개 사이트 열기" }).click();
  await page.waitForURL(url);
  await page.getByRole("heading", { name: /처음이어도/ }).waitFor();
  report.checks.qrDestination = page.url();
  const manifestUrl = await page.locator('link[rel="manifest"]').evaluate(node => node.href);
  const manifest = await (await page.request.get(manifestUrl)).json();
  assert.equal(manifest.name, "우리 모두 배구왕");
  assert.equal(new URL(manifest.scope, manifestUrl).href, url);
  for (const icon of manifest.icons) {
    const image = PNG.sync.read(await (await page.request.get(new URL(icon.src, manifestUrl).href)).body());
    assert.equal(`${image.width}x${image.height}`, icon.sizes);
  }
  report.checks.manifest = { name: manifest.name, start: new URL(manifest.start_url, manifestUrl).href, icons: manifest.icons.map(icon => icon.sizes) };
  const registration = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return { scope: r.scope, script: r.active.scriptURL }; });
  assert.equal(registration.scope, url);
  report.checks.serviceWorker = registration;
  const staticPaths = ["index.html", "manifest.webmanifest", "sw.js", "icons/ball-180.png", "icons/ball-192.png", "icons/ball-512.png"];
  const html = await readFile("dist/index.html", "utf8");
  staticPaths.push(...[...html.matchAll(/(?:src|href)="\.\/(assets\/[^"]+)"/g)].map(match => match[1]));
  for (const path of staticPaths) {
    const response = await page.request.get(new URL(path, url).href);
    assert.equal(response.status(), 200);
    const digest = bytes => createHash("sha256").update(bytes).digest("hex");
    assert.equal(digest(await response.body()), digest(await readFile(`dist/${path}`)), path);
  }
  report.checks.deployedBytes = { matchesLocal: staticPaths };
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("heading", { name: /처음이어도/ }).waitFor();
  await page.goto(url + "#/skills");
  await page.locator(".skill-card").first().waitFor();
  assert.equal(await page.locator(".skill-card").count(), 6);
  report.checks.offline = "public origin reload + 6 skill cards";
  await context.setOffline(false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".share-install > details > summary").click();
  await page.getByAltText("우리 모두 배구왕 공개 사이트 QR코드").waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await mkdir("artifacts", { recursive: true });
  await page.locator(".share-install").screenshot({ path: "artifacts/sharing-live-mobile.png" });
  report.checks.mobile = "390px, no horizontal overflow";
  await writeFile("docs/sharing-public-checks.json", JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
