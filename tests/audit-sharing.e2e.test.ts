import { test, expect, chromium, webkit, devices } from '@playwright/test';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { APP_URL, BUILD_URL } from './urls';

test('header QR is fully visible and decodable immediately in mobile landscape', async () => {
  test.setTimeout(120000);
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      for (const [width, height] of [[568, 320], [667, 375]]) {
        const context = await browser.newContext({
          ...devices[engine === webkit ? 'iPhone 13' : 'Pixel 7'],
          viewport: { width, height },
        });
        try {
          const page = await context.newPage();
          await page.goto(`${APP_URL}#/home`);
          await page.locator('[data-qr]').tap();
          const dialog = page.getByRole('dialog', { name: '📱 카메라로 찍어서 들어와요' });
          await expect(dialog).toBeFocused();
          const qr = dialog.locator('.yq-qr');
          await qr.evaluate((image: HTMLImageElement) => image.decode());
          expect(await dialog.evaluate(element => element.scrollTop)).toBe(0);
          const cardBox = (await dialog.boundingBox())!;
          const qrBox = (await qr.boundingBox())!;
          expect(qrBox.y).toBeGreaterThanOrEqual(cardBox.y);
          expect(qrBox.y + qrBox.height).toBeLessThanOrEqual(cardBox.y + cardBox.height);
          // Decode the visible viewport, without scrolling the QR into view first.
          const screenshot = PNG.sync.read(await page.screenshot());
          expect(jsQR(new Uint8ClampedArray(screenshot.data), screenshot.width, screenshot.height)?.data)
            .toBe('https://gmlduqzhd123-lab.github.io/Volleyball/');
          await page.keyboard.press('Tab');
          await expect(dialog.getByRole('button', { name: '닫기' })).toBeFocused();
          await page.keyboard.press('Escape');
          await expect(dialog).toHaveCount(0);
          await expect(page.locator('[data-qr]')).toBeFocused();
          expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
          const installTrigger = page.locator('[data-ys-install]');
          await installTrigger.tap();
          const installDialog = page.getByRole('dialog', { name: '📲 앱으로 설치하기' });
          await expect(installDialog).toBeFocused();
          expect(await installDialog.evaluate(element => element.scrollTop)).toBe(0);
          await page.keyboard.press('Shift+Tab');
          await expect(installDialog.getByRole('button', { name: '닫기' })).toBeFocused();
          await page.keyboard.press('Escape');
          await expect(installDialog).toHaveCount(0);
          await expect(installTrigger).toBeFocused();
          expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
        } finally {
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
});

test('installed service worker keeps cached learning pages available during HTTP 503 failures', async ({ page, context }) => {
  await page.goto(`${BUILD_URL}#/home`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  const failedPaths = new Set<string>();
  const rootPath = new URL(BUILD_URL).pathname;
  await context.route(`${BUILD_URL}**`, route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.serviceWorker() && [rootPath, `${rootPath}data/skills.json`].includes(path)) {
      failedPaths.add(path);
      return route.fulfill({ status: 503, contentType: 'text/plain', body: 'Service temporarily unavailable' });
    }
    return route.continue();
  });
  const response = await page.reload();
  expect(response?.status()).toBe(200);
  await expect(page.locator('main h1')).toContainText('처음이어도');
  await page.goto(`${BUILD_URL}#/skills`);
  await expect(page.locator('.skill-card')).toHaveCount(6);
  expect(failedPaths.has(rootPath)).toBe(true);
  expect(failedPaths.has(`${rootPath}data/skills.json`)).toBe(true);
});
