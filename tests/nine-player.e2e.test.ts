import { test, expect } from '@playwright/test';

test('court numbers explain all nine locations on desktop and touch screens', async ({ browser }) => {
  const names = ['전위 왼쪽', '전위 중앙', '전위 오른쪽', '중위 왼쪽', '중위 중앙', '중위 오른쪽', '후위 왼쪽', '후위 중앙', '후위 오른쪽'];
  const roleNames = ['레프트','센터','라이트','수비 담당','세터','수비 담당','수비 담당','수비 담당','수비 담당'];
  for (const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width < 600 });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/#/positions');
    const spots = page.locator('.court-spot');
    const detail = page.locator('#court-position-detail');
    await expect(spots).toHaveCount(9);
    const roles = new Set<string>();
    for (let i = 0; i < 9; i++) {
      if (width < 600) await spots.nth(i).tap();
      else await spots.nth(i).click();
      await expect(detail.getByRole('heading')).toContainText(names[i]);
      await expect(detail).toContainText(`선수 ${i + 1}`);
      await expect(detail.locator('dd').first()).toContainText('네트를 바라볼 때');
      roles.add(await detail.locator('dd').nth(1).innerText());
      await expect(page.locator('.role-description h2')).toHaveText(roleNames[i]);
      await expect(page.locator('.role-description')).toContainText(`선수 ${i + 1}`);
      await expect(page.locator('.role-buttons button[aria-pressed="true"]')).toContainText(roleNames[i]);
      await expect(detail).toContainText('초보자 팁');
      await expect(spots.nth(i)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.court-spot[aria-pressed="true"]')).toHaveCount(1);
      await expect(spots.nth(i).locator('circle')).toHaveAttribute('fill', '#194a3a');
      const box = await spots.nth(i).boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    expect(roles.size).toBe(9);
    for (const [name, index] of [['세터',4],['레프트',0],['라이트',2],['센터',1],['수비 담당',3]] as const) {
      await page.locator('.role-buttons button').filter({hasText:name}).click();
      await expect(spots.nth(index)).toHaveAttribute('aria-pressed','true');
      await expect(page.locator('.role-description h2')).toHaveText(name);
      await expect(detail).toContainText(`선수 ${index + 1}`);
    }
    await spots.nth(0).focus();
    await page.keyboard.press('Enter');
    await expect(detail.getByRole('heading')).toContainText(names[0]);
    await spots.nth(4).focus();
    await page.keyboard.press('Space');
    await expect(detail.getByRole('heading')).toContainText(names[4]);
    await expect(page.locator('.court-caption')).toContainText('공식 포지션 번호나 서브 타순이 아니에요');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', {name: '다음 서버', exact: true}).click();
    await expect(page.locator('.rotation-controls')).toContainText('선수 2');
    await expect(detail.getByRole('heading')).toContainText(names[4]);
    await page.locator('.court-panel h2').click();
    await page.locator('.court-panel').screenshot({path: `artifacts/court-positions-${width}.png`});
    await context.close();
  }
});

test('nine-player video position filters combine categories and search without losing videos', async ({ page }) => {
  const mapping: Record<string,string> = {setter:'setter',outside:'left',opposite:'right',middle:'center',libero:'defense',left:'left',right:'right',center:'center',defense:'defense'};
  for (const width of [1440,390,360]) {
    await page.setViewportSize({width,height:900});
    await page.goto('/#/videos');
    await page.reload();
    const data=await (await page.request.get('/data/videos.json')).json();
    const select=page.getByLabel('포지션 (9인제)',{exact:true});
    await expect(select.locator('option')).toHaveText(['모든 포지션','세터','레프트','라이트','센터','수비 담당']);
    await expect(page.locator('.video-card')).toHaveCount(84);
    for(const role of ['setter','left','right','center','defense']){
      await select.selectOption(role);
      const expected=data.filter((v:any)=>v.positionTags.some((t:string)=>mapping[t]===role));
      await expect(page.locator('.video-card')).toHaveCount(expected.length);
      expect((await page.locator('.video-card .tags').allTextContents()).join(' ')).not.toMatch(/리베로|아웃사이드 히터|아포짓|미들 블로커/);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
    await page.getByRole('button',{name:'기초 영상',exact:true}).click();
    const defense=data.filter((v:any)=>v.category==='skill'&&v.positionTags.includes('libero'));
    await expect(page.locator('.video-card')).toHaveCount(defense.length);
    await page.getByRole('textbox',{name:'영상 제목 검색'}).fill(defense[0].title);
    await expect(page.locator('.video-card')).toHaveCount(1);
    await page.locator('.video-card').click();
    await expect(page.locator('.page-title')).toContainText(defense[0].title);
    await expect(page.getByText('9인제 학습 역할:',{exact:false})).toContainText('수비 담당');
    await expect(page.locator('iframe')).toHaveCount(0);
  }
  await page.goto('/#/editor');
  await page.getByLabel('유튜브 링크').fill('https://youtu.be/M7lc1UVf-VE');
  await page.getByLabel('영상 제목').fill('9인제 역할 분류 검증');
  await page.getByLabel('경기 날짜').fill('2026-10-12');
  await page.getByRole('checkbox',{name:'수비 담당',exact:true}).check();
  await page.getByRole('button',{name:'JSON 생성',exact:true}).click();
  expect(JSON.parse(await page.locator('pre').innerText()).positionTags).toEqual(['defense']);
});

test('all six skill lessons show nine-player guidance and preserve reference videos', async ({ page }) => {
  const lessons = [['underhand-pass',10],['overhand-pass',10],['serve',10],['spike',10],['blocking',6],['dig',8]] as const;
  for (const width of [1440,390,360]) {
    await page.setViewportSize({width,height:900});
    await page.goto('/#/skills');
    await expect(page.locator('.page-title')).toContainText('9인제 배구');
    await expect(page.locator('.skill-card')).toHaveCount(6);
    for (const [id, count] of lessons) {
      await page.goto(`/#/skill/${id}`);
      const notes=page.locator('.nine-player-skill-notes');
      await expect(notes.getByRole('heading',{name:'9인제에서 기억해요',exact:true})).toBeVisible();
      await expect(notes.getByRole('link')).toHaveAttribute('href','https://www.kva.or.kr/user/template.do?fileNm=vlb2_1');
      await expect(page.locator('.video-card')).toHaveCount(count);
      await expect(page.locator('iframe')).toHaveCount(0);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      if(id==='serve') await expect(page.locator('.steps')).toContainText('손에서 떨어뜨려요');
      if(id==='spike') await expect(notes).toContainText('전위·후위 공격 제한을 적용하지 않아요');
      if(id==='blocking') await expect(notes).toContainText('상대 서브를 블로킹하는 것은 금지');
      if(id==='dig') await expect(notes).toContainText('리베로 제도를 적용하지 않아요');
    }
    await page.screenshot({path:`research/nine-player/skill-dig-${width}.png`,fullPage:true});
  }
});

test('nine-player beginner rules and terms on desktop and mobile', async ({ page }) => {
  for (const width of [1440, 390, 360]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/beginner');
    await page.reload();
    await expect(page.locator('.page-title')).toContainText('9인제 기준');
    await page.getByRole('textbox', { name: '용어 검색' }).fill('서브 타순');
    await expect(page.locator('.term-card')).toHaveCount(1);
    await expect(page.locator('.term-card')).toContainText('자리 로테이션을 하지 않아요');
    await page.getByRole('textbox', { name: '용어 검색' }).fill('수비 담당');
    await expect(page.locator('.term-card')).toContainText('리베로 제도가 없어요');
    await page.getByRole('button', { name: '규칙 배우기', exact: true }).click();
    await expect(page.getByText('대한배구협회 9인제 기본 규칙', { exact: true })).toBeVisible();
    await expect(page.locator('.rule-card')).toHaveCount(8);
    await expect(page.locator('.rules-grid')).toContainText('21점제');
    await expect(page.locator('.rules-grid')).toContainText('남자 21m × 10.5m');
    await expect(page.locator('.rules-grid')).toContainText('초등부는 남녀 모두 16m × 8m');
    await expect(page.locator('.rules-grid')).toContainText('4번째 접촉');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `research/nine-player/beginner-${width}.png`, fullPage: true });
  }
});

test('nine-player ten correct answers, explanations, result and reload', async ({ page }) => {
  await page.goto('/#/quiz');
  await expect(page.locator('.page-title')).toContainText('9인제 배구 퀴즈');
  const answers = ['리시브', '9명', '3번', '다음 타순 선수가 서브해요', '세터',
    '일반 선수로 서브와 공격에도 참여해요', '아래팔의 평평한 면', '2점 차가 날 때까지 계속',
    '엔드라인 뒤의 서비스 지역', '한 번에 한해 어떤 선수든 다시 플레이할 수 있어요'];
  for (let i = 0; i < answers.length; i++) {
    await page.locator('.quiz-choices button').filter({ hasText: answers[i] }).click();
    await page.getByRole('button', { name: '정답 확인', exact: true }).click();
    await expect(page.locator('.answer-explanation')).toContainText('정답');
    await page.getByRole('button', { name: i === 9 ? '결과 보기' : '다음 문제', exact: true }).click();
  }
  await expect(page.locator('.score')).toContainText('10');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('volleyball-quiz-result')!)))
    .toMatchObject({ ruleSet: 'nine-player-v1', score: 10, total: 10 });
  await page.reload();
  await expect(page.getByText('지난 기록 10 / 10점')).toBeVisible();
});

test('six-player legacy result is retained but not shown as a nine-player result', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('volleyball-quiz-result', JSON.stringify({score:6,total:10})));
  await page.goto('/#/quiz');
  await expect(page.locator('.page-title')).toContainText('9인제 배구 퀴즈');
  await expect(page.getByText('지난 기록 6 / 10점')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('volleyball-quiz-result')!).score)).toBe(6);
});
