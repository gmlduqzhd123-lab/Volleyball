import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";
import jsQR from "jsqr";
import { readFile } from "node:fs/promises";

const url = "https://gmlduqzhd123-lab.github.io/Volleyball/";
async function openSharing(page: import("@playwright/test").Page) {
  await page.locator(".share-install > details > summary").click();
  await expect(page.getByAltText("우리 모두 배구왕 공개 사이트 QR코드")).toBeVisible();
}
test("footer on routes, QR decode and PNG download, mobile layout", async ({ page }) => {
  for (const route of ["home", "videos", "pro", "skills", "skill/underhand-pass", "positions", "beginner", "quiz", "editor", "video/missing", "missing"]) {
    await page.goto(`/#/${route}`);
    await expect(page.locator(".copyright")).toContainText("© 2026 엽쌤. All rights reserved.");
    await expect(page.locator(".copyright")).toContainText("각 원저작자");
  }
  await page.goto("/");
  await openSharing(page);
  const source = await page.getByAltText("우리 모두 배구왕 공개 사이트 QR코드").getAttribute("src");
  const png = PNG.sync.read(Buffer.from(source!.split(",")[1], "base64"));
  expect(jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data).toBe(url);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "QR 이미지 저장" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("volleyball-king-qr.png");
  const downloaded = PNG.sync.read(await readFile((await download.path())!));
  expect(downloaded.width).toBe(360);
  for (const width of [360, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByRole("button", { name: "링크 복사" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".share-install").screenshot({ path: "artifacts/sharing-mobile.png" });
});
test("real browser clipboard and unsupported share installation help", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await openSharing(page);
  await page.getByRole("button", { name: "링크 복사" }).click();
  await expect(page.locator(".share-status")).toHaveText("링크를 복사했어요.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);
  await expect(page.getByText("아이폰·아이패드", { exact: true })).toBeVisible();
  await expect(page.getByText("안드로이드", { exact: true })).toBeVisible();
  await expect(page.getByText("Windows·Mac", { exact: true })).toBeVisible();
});
test("native sharing payload, cancel and denied clipboard paths (simulated APIs)", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => {
      (window as any).sharePayload = data;
      if ((window as any).cancelShare) throw new DOMException("Canceled", "AbortError");
    } });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Denied"); } } });
  });
  await page.goto("/");
  await openSharing(page);
  await page.getByRole("button", { name: "기기로 공유" }).click();
  expect(await page.evaluate(() => (window as any).sharePayload)).toMatchObject({ title: "우리 모두 배구왕", url });
  await page.getByRole("button", { name: "링크 복사" }).click();
  await expect(page.locator(".share-status")).toContainText("자동 복사가 지원되지");
  await expect(page.getByRole("textbox", { name: "공유 링크" })).toHaveValue(url);
  await page.evaluate(() => { (window as any).cancelShare = true; });
  await page.getByRole("button", { name: "기기로 공유" }).click();
  await expect(page.locator(".share-status")).not.toContainText("공유 창을 열지 못했어요");
});
test("install prompt is single use, dismissal and appinstalled (simulated event)", async ({ page }) => {
  await page.goto("/");
  await openSharing(page);
  await expect(page.getByRole("button", { name: "앱 설치", exact: true })).toHaveCount(0);
  await page.evaluate(() => {
    (window as any).promptCount = 0;
    const event = new Event("beforeinstallprompt", { cancelable: true });
    Object.assign(event, { prompt: async () => { (window as any).promptCount++; }, userChoice: Promise.resolve({ outcome: "dismissed" }) });
    window.dispatchEvent(event);
    (window as any).installPrevented = event.defaultPrevented;
  });
  await page.getByRole("button", { name: "앱 설치", exact: true }).click();
  await expect(page.locator(".share-status")).toContainText("설치를 취소했어요");
  expect(await page.evaluate(() => (window as any).promptCount)).toBe(1);
  expect(await page.evaluate(() => (window as any).installPrevented)).toBe(true);
  await expect(page.getByRole("button", { name: "앱 설치", exact: true })).toHaveCount(0);
  await page.evaluate(() => window.dispatchEvent(new Event("appinstalled")));
  await expect(page.locator(".installed-note")).toBeVisible();
});
test("built subpath manifest, PNG icons and real service worker offline reload", async ({ page, context }) => {
  await page.goto("http://127.0.0.1:5174/volleyball/#/home");
  const manifestUrl = await page.locator('link[rel="manifest"]').evaluate((node: HTMLLinkElement) => node.href);
  const manifest = await (await page.request.get(manifestUrl)).json();
  expect(manifest.name).toBe("우리 모두 배구왕");
  expect(new URL(manifest.start_url, manifestUrl).href).toBe("http://127.0.0.1:5174/volleyball/#/home");
  for (const icon of manifest.icons) {
    const image = PNG.sync.read(await (await page.request.get(new URL(icon.src, manifestUrl).href)).body());
    expect(`${image.width}x${image.height}`).toBe(icon.sizes);
  }
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  expect(await page.evaluate(async () => (await navigator.serviceWorker.ready).scope)).toBe("http://127.0.0.1:5174/volleyball/");
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: /처음이어도/ })).toBeVisible();
  await page.goto("http://127.0.0.1:5174/volleyball/#/skills");
  await expect(page.locator(".skill-card")).toHaveCount(6);
  await openSharing(page);
  await expect(page.getByAltText("우리 모두 배구왕 공개 사이트 QR코드")).toBeVisible();
  await context.setOffline(false);
});
