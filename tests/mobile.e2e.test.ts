import { test, expect, chromium, webkit, devices } from '@playwright/test';
const mobileBase = process.env.MOBILE_BASE_URL ?? 'http://127.0.0.1:5173/';

test('touch navigation, categories, search and player on portrait and landscape in Chromium and WebKit', async () => {
  test.setTimeout(180000);
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch();
    try {
      for (const [width, height] of [[320,568], [360,800], [390,844], [430,932], [667,375], [844,390]]) {
        const userAgent = devices[engine === webkit ? 'iPhone 13' : 'Pixel 7'].userAgent;
        const context = await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,userAgent});
        const page = await context.newPage();
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        // Player initialization is checked independently of YouTube's network and playback restrictions.
        if (!process.env.MOBILE_BASE_URL) await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({body:'<html>Player test frame</html>',contentType:'text/html'}));
        await page.goto(`${mobileBase}#/home`);
        for (const route of ['home','videos','beginner','skills','positions','quiz','skill/serve']) {
          await page.goto(`${mobileBase}#/${route}`);
          await expect(page.locator('main h1')).toBeVisible();
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
        }
        await page.goto(`${mobileBase}#/home`);
        await page.evaluate(() => scrollTo(0,0));
        expect((await page.locator('.header-actions').boundingBox())!.x + (await page.locator('.header-actions').boundingBox())!.width).toBeLessThanOrEqual(width);
        await page.getByRole('button',{name:'메뉴 열기',exact:true}).tap();
        await page.locator('#main-nav').getByRole('link',{name:'포지션 배우기',exact:true}).tap();
        await expect(page).toHaveURL(/#\/positions$/);
        await expect(page.locator('#main-nav')).toBeHidden();
        await page.getByRole('button',{name:'메뉴 열기',exact:true}).tap();
        await page.locator('#main-nav').getByRole('link',{name:'배구 영상',exact:true}).tap();
        await expect(page.locator('.video-card')).toHaveCount(84);
        await page.getByRole('button',{name:'초등 배구',exact:true}).tap();
        await expect(page.locator('.video-card')).toHaveCount(10);
        await page.getByRole('button',{name:'전체',exact:true}).tap();
        const title = await page.locator('.video-card h3').first().innerText();
        await page.getByRole('textbox',{name:'영상 제목 검색'}).fill(title);
        await expect(page.locator('.video-card')).toHaveCount(1);
        await page.locator('.video-card').first().tap();
        await expect(page.locator('iframe')).toHaveCount(0);
        await page.locator('.player-launch').tap();
        await expect(page.locator('iframe')).toHaveAttribute('src',/youtube-nocookie\.com\/embed\//);
        expect(await page.locator('iframe').getAttribute('src')).not.toContain('autoplay=1');
        await page.goto(`${mobileBase}#/home`);
        await page.evaluate(() => scrollTo(0,0));
        await page.locator('[data-qr]').tap();
        await expect(page.locator('.yq-card')).toBeVisible();
        expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
        await page.keyboard.press('Tab');
        await expect(page.locator('.yq-close')).toBeFocused();
        await page.locator('.yq-close').tap();
        expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
        await page.locator('[data-ys-install]').tap();
        await expect(page.locator('.ysi-card')).toBeVisible();
        await page.locator('[data-ysi-close]').tap();
        expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
        expect(errors).toEqual([]);
        await page.screenshot({path:`research/mobile/${process.env.MOBILE_BASE_URL ? 'live-' : ''}${engine.name()}-${width}.png`});
        await context.close();
      }
    } finally { await browser.close(); }
  }
});

test('header and footer consume one shared installation request in both directions', async ({page}) => {
  await page.goto('/');
  await page.locator('.share-install > details > summary').click();
  for (const first of ['header','footer']) {
    await page.evaluate(() => {
      const w = window as any;
      w.promptCount = 0;
      const event = new Event('beforeinstallprompt',{cancelable:true});
      Object.assign(event,{prompt:async()=>{if (++w.promptCount > 1) throw Error('Already consumed');},userChoice:Promise.resolve({outcome:'dismissed'})});
      window.dispatchEvent(event);
    });
    await expect(page.getByRole('button',{name:'앱 설치',exact:true})).toBeVisible();
    if (first === 'header') await page.locator('[data-ys-install]').click();
    else await page.getByRole('button',{name:'앱 설치',exact:true}).click();
    await expect(page.getByRole('button',{name:'앱 설치',exact:true})).toHaveCount(0);
    await page.locator('[data-ys-install]').click();
    await expect(page.locator('.ysi-card')).toBeVisible();
    expect(await page.evaluate(() => (window as any).promptCount)).toBe(1);
    await page.locator('[data-ysi-close]').click();
  }
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.locator('[data-ys-install]')).toBeHidden();
  await expect(page.locator('.installed-note')).toBeVisible();
});
