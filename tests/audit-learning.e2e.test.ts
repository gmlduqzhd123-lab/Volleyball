import { test, expect, chromium, webkit, devices } from '@playwright/test';
import { APP_URL } from './urls';
const base = process.env.AUDIT_BASE_URL ?? APP_URL;

test('filtered video list survives browser back and the detail list link', async ({ page }) => {
  await page.goto(`${base}#/videos`);
  await page.getByRole('button', {name:'기초 영상',exact:true}).click();
  await page.getByRole('textbox', {name:'영상 제목 검색'}).fill('스파이크');
  await page.getByLabel('포지션 (9인제)',{exact:true}).selectOption('defense');
  await expect(page.locator('.video-card')).toHaveCount(3);
  const links = await page.locator('.video-card').evaluateAll(cards => cards.map(card => card.getAttribute('href')));
  for (const returnMode of ['back','link']) {
    await page.locator('.video-card').first().click();
    await expect(page.locator('.player-launch')).toBeVisible();
    if (returnMode === 'back') await page.goBack();
    else await page.getByRole('link',{name:'영상 목록',exact:true}).click();
    await expect(page.getByRole('textbox',{name:'영상 제목 검색'})).toHaveValue('스파이크');
    await expect(page.getByLabel('포지션 (9인제)',{exact:true})).toHaveValue('defense');
    await expect(page.getByRole('button',{name:'기초 영상',exact:true})).toHaveAttribute('aria-pressed','true');
    expect(await page.locator('.video-card').evaluateAll(cards => cards.map(card => card.getAttribute('href')))).toEqual(links);
  }
  await page.getByRole('textbox',{name:'영상 제목 검색'}).fill('아무 결과도 없는 검색어');
  await page.getByRole('button',{name:'필터 초기화'}).click();
  await expect(page.locator('.video-card')).toHaveCount(84);
});

test('legacy pro list returns to its own filters without changing the main video list', async ({page}) => {
  await page.goto(`${base}#/pro`);
  await expect(page.locator('.video-card')).toHaveCount(10);
  const title = await page.locator('.video-card h3').first().innerText();
  await page.getByRole('textbox',{name:'영상 제목 검색'}).fill(title);
  await expect(page.locator('.video-card')).toHaveCount(1);
  for (const returnMode of ['back','link']) {
    await page.locator('.video-card').first().click();
    await expect(page.locator('.player-launch')).toBeVisible();
    if (returnMode === 'back') await page.goBack();
    else await page.getByRole('link',{name:'영상 목록',exact:true}).click();
    await expect(page).toHaveURL(/#\/pro$/);
    await expect(page.getByRole('textbox',{name:'영상 제목 검색'})).toHaveValue(title);
    await expect(page.getByRole('button',{name:'프로팀 경기',exact:true})).toHaveAttribute('aria-pressed','true');
    await expect(page.locator('.video-card')).toHaveCount(1);
  }
  await page.locator('#main-nav').getByRole('link',{name:'배구 영상',exact:true}).click();
  await expect(page.locator('.video-card')).toHaveCount(84);
  await expect(page.getByRole('textbox',{name:'영상 제목 검색'})).toHaveValue('');
  await page.locator('.video-card').first().click();
  await expect(page.getByRole('link',{name:'영상 목록',exact:true})).toHaveAttribute('href','#/videos');
});

test('mobile quiz reveals each new question, result and retry with the latest saved score', async () => {
  test.setTimeout(90000);
  for (const engine of [chromium,webkit]) {
    const browser = await engine.launch();
    try {
      const context = await browser.newContext({viewport:{width:320,height:568},isMobile:true,hasTouch:true,
        userAgent:devices[engine===webkit?'iPhone 13':'Pixel 7'].userAgent});
      await context.addInitScript(() => localStorage.setItem('volleyball-quiz-result', JSON.stringify({ruleSet:'nine-player-v1',score:1,total:10})));
      const page = await context.newPage();
      await page.goto(`${base}#/quiz`);
      const questions = await (await page.request.get(`${base}data/quizzes.json`)).json();
      await expect(page.locator('.quiz-card')).toContainText('지난 기록 1 / 10점');
      for(let i=0;i<questions.length;i++) {
        if(i>0){
          await expect(page.locator('.quiz-card h2')).toBeFocused();
          await expect(page.locator('.quiz-card h2')).toBeInViewport();
        }
        await page.locator('.quiz-choices button').nth(questions[i].correctIndex).tap();
        await page.getByRole('button',{name:'정답 확인',exact:true}).tap();
        await page.getByRole('button',{name:i===questions.length-1?'결과 보기':'다음 문제',exact:true}).tap();
      }
      await expect(page.locator('.quiz-result > h2')).toBeFocused();
      await expect(page.locator('.quiz-result > h2')).toBeInViewport();
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('volleyball-quiz-result')!).score)).toBe(10);
      await page.getByRole('button',{name:'다시 풀기'}).tap();
      await expect(page.locator('.quiz-card h2')).toBeFocused();
      await expect(page.locator('.quiz-card h2')).toBeInViewport();
      await expect(page.locator('.quiz-card')).toContainText('지난 기록 10 / 10점');
      await page.screenshot({path:`research/audit-20261015/${process.env.AUDIT_BASE_URL?'live-':''}quiz-fixed-${engine.name()}.png`});
      await context.close();
    } finally { await browser.close(); }
  }
});

test('detail pages expose the active parent menu to assistive technology', async ({page}) => {
  for(const [route,label] of [['skill/serve','배구 기술 교실'],['video/pro-01','배구 영상']]) {
    await page.goto(`${base}#/${route}`);
    await expect(page.locator('#main-nav').getByRole('link',{name:label,exact:true})).toHaveAttribute('aria-current','location');
    await expect(page.locator('#main-nav [aria-current]')).toHaveCount(1);
  }
});
