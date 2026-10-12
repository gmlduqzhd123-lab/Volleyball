import { test, expect } from "@playwright/test";
const sample = [
  {
    id: "match-1",
    youtubeId: "M7lc1UVf-VE",
    title: "검증용 경기 <script>alert(1)</script>",
    date: "2026-10-12",
    category: "club",
    positionTags: ["setter"],
    startSeconds: 35,
  },
  {
    id: "match-2",
    youtubeId: "aqz-KE-bpKQ",
    title: "검증용 프로 경기",
    date: "2026-01-01",
    category: "pro",
    positionTags: ["libero"],
    startSeconds: 0,
  },
];
test("home, all main menus and no automatic iframe", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /처음이어도/ })).toBeVisible();
  expect(await page.locator("iframe").count()).toBe(0);
  for (const [route, title] of [
    ["videos", "우리들의 경기 영상"],
    ["beginner", "배구 왕초보 교실"],
    ["skills", "배구 기술 교실"],
    ["positions", "코트 위, 나의 역할"],
    ["pro", "프로배구 영상관"],
  ]) {
    await page.goto(`/#/${route}`);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
});
test("terms, rules, lesson detail and keyboard court rotation", async ({
  page,
}) => {
  await page.goto("/#/beginner");
  await page.getByRole("textbox", { name: "용어 검색" }).fill("디그");
  await expect(page.locator(".term-card")).toHaveCount(1);
  await page.getByRole("button", { name: "규칙 배우기" }).click();
  await expect(
    page.getByRole("heading", { name: "점수와 세트" }),
  ).toBeVisible();
  await page.goto("/#/skill/underhand-pass");
  await expect(page.locator(".steps li")).toHaveCount(4);
  await page.goto("/#/positions");
  await page.getByRole("button", { name: "다음 위치" }).click();
  await expect(
    page.getByRole("button", { name: "1번 위치, 선수 2" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "3번 위치, 선수 4" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".court-caption")).toContainText("3번");
  await page.getByRole("button", { name: "L 리베로", exact: true }).click();
  await expect(page.locator(".role-description h2")).toHaveText("리베로");
});
test("10 question scoring, feedback, storage and retry", async ({ page }) => {
  await page.goto("/#/quiz");
  for (let i = 0; i < 10; i++) {
    await expect(page.locator(".quiz-choices button")).toHaveCount(4);
    await page.locator(".quiz-choices button").first().click();
    await page.getByRole("button", { name: "정답 확인" }).click();
    await expect(page.locator(".answer-explanation")).toBeVisible();
    await page
      .getByRole("button", { name: i === 9 ? "결과 보기" : "다음 문제" })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "첫 랠리, 멋지게 완료!" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("volleyball-quiz-result")!).total,
    ),
  ).toBe(10);
  await page.getByRole("button", { name: "다시 풀기" }).click();
  await expect(page.locator(".quiz-progress")).toContainText("1 / 10");
  await page.reload();
  await expect(page.getByText("지난 기록 3 / 10점")).toBeVisible();
});
test("JSON editor rejects bad links and exports safe metadata", async ({
  page,
}) => {
  await page.goto("/#/editor");
  await page.getByRole("button", { name: "JSON 생성" }).click();
  await expect(page.locator("#url-error")).toBeVisible();
  await page.getByLabel("유튜브 링크").fill("https://youtu.be/M7lc1UVf-VE");
  await page.getByLabel("영상 제목").fill("<img src=x onerror=alert(1)>");
  await page.getByLabel("경기 날짜").fill("2026-10-12");
  await page.getByLabel("장면 시작 시간 (초)").fill("35");
  await page.getByRole("button", { name: "JSON 생성" }).click();
  const output = JSON.parse(await page.locator("pre").innerText());
  expect(output.youtubeId).toBe("M7lc1UVf-VE");
  expect(output.startSeconds).toBe(35);
  expect(await page.locator(".json-panel img").count()).toBe(0);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON 다운로드" }).click();
  expect((await downloadPromise).suggestedFilename()).toBe("video-entry.json");
});
test("video search, filters, delayed embed and original link", async ({
  page,
}) => {
  await page.route("**/data/videos.json", (route) =>
    route.fulfill({ json: sample }),
  );
  await page.goto("/#/videos");
  await expect(page.locator(".video-card")).toHaveCount(2);
  await page.getByRole("textbox", { name: "영상 제목 검색" }).fill(" 프로");
  await expect(page.locator(".video-card")).toHaveCount(1);
  await page.getByRole("textbox", { name: "영상 제목 검색" }).fill("");
  await expect(page.locator(".tabs button")).toHaveText(["전체", "예능배구", "기초 영상", "프로팀 경기", "초등 배구"]);
  await expect(page.getByRole("button", { name: "전체", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "우리 동호회", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "프로팀 경기", exact: true }).click();
  await expect(page.locator(".video-card")).toHaveCount(1);
  await page.getByRole("button", { name: "전체", exact: true }).click();
  await expect(page.locator(".video-card")).toHaveCount(2);
  await page.locator(".video-card").filter({hasText: sample[0].title}).click();
  await expect(
    page.getByRole("heading", { name: sample[0].title, exact: true }),
  ).toBeVisible();
  expect(await page.locator("iframe").count()).toBe(0);
  await expect(
    page.getByRole("link", { name: "유튜브에서 보기" }),
  ).toHaveAttribute("href", /t=35s/);
  await page.getByRole("button", { name: /플레이어 열기/ }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", /start=35/);
});
test("bad JSON has recovery and other lessons still work", async ({ page }) => {
  await page.route("**/data/videos.json", (r) =>
    r.fulfill({ body: "broken-json", contentType: "application/json" }),
  );
  await page.goto("/#/videos");
  await expect(page.getByRole("alert")).toContainText(
    "영상 목록을 불러올 수 없습니다",
  );
  await page.unroute("**/data/videos.json");
  await page.route("**/data/videos.json", (r) => r.fulfill({ json: [] }));
  await page.getByRole("button", { name: "다시 시도" }).click();
  await expect(
    page.getByRole("heading", { name: "우리의 첫 경기를 기다리고 있어요" }),
  ).toBeVisible();
  await page.goto("/#/skills");
  await expect(page.locator(".skill-card")).toHaveCount(6);
});
test("published catalog, technical links and upload/match dates", async ({ page }) => {
  await page.goto("/#/pro");
  await expect(page.locator(".video-card")).toHaveCount(10);
  await expect(page.locator(".video-card").first()).toContainText("SBS Sports");
  await expect(page.locator(".video-card").first()).toContainText("업로드");
  expect(await page.locator("iframe").count()).toBe(0);
  for (const [id, count] of [["underhand-pass", 10], ["overhand-pass", 10], ["serve", 10], ["spike", 10], ["blocking", 6], ["dig", 8]] as const) {
    await page.goto(`/#/skill/${id}`);
    await expect(page.locator(".video-card")).toHaveCount(count);
  }
  await page.goto("/#/video/pro-01");
  await expect(page.locator("main")).toContainText("업로드 2025-04-03");
  await expect(page.locator("main")).toContainText("경기 2025-04-02");
  await expect(page.locator(".video-detail-summary")).not.toBeEmpty();
});
test("entertainment tabs, search, retained sources and mobile controls", async ({ page }) => {
  for (const width of [360, 390, 1440]) {
    await page.setViewportSize({width, height: 844});
    await page.goto('/#/videos');
    await page.reload();
    await expect(page.locator('.video-card')).toHaveCount(84);
    await expect(page.locator('.tabs button')).toHaveText(['전체', '예능배구', '기초 영상', '프로팀 경기', '초등 배구']);
    await expect(page.getByRole('button', {name: '전체', exact: true})).toHaveAttribute('aria-pressed', 'true');
    for (const b of await page.locator('.tabs button').all()) {
      const box=await b.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x+box!.width).toBeLessThanOrEqual(width);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole('button', {name: '예능배구', exact: true}).click();
    await expect(page.locator('.video-card')).toHaveCount(10);
    await expect(page.locator('.video-card').first()).toContainText('원더독스 라커룸');
    await expect(page.locator('.video-card').first()).toContainText('업로드');
    await page.getByRole('textbox', {name: '영상 제목 검색'}).fill('인쿠시');
    expect(await page.locator('.video-card').count()).toBeGreaterThan(0);
    await page.getByRole('textbox', {name: '영상 제목 검색'}).fill('없는영상테스트');
    await expect(page.locator('.video-card')).toHaveCount(0);
    await page.getByRole('textbox', {name: '영상 제목 검색'}).fill('');
    await page.getByRole('button', {name: '기초 영상', exact: true}).click();
    await expect(page.locator('.video-card')).toHaveCount(54);
    await page.getByRole('button', {name: '프로팀 경기', exact: true}).click();
    await expect(page.locator('.video-card')).toHaveCount(10);
    await page.getByRole('button', {name: '초등 배구', exact: true}).click();
    await expect(page.locator('.video-card')).toHaveCount(10);
    await expect(page.locator('.video-card').first()).toContainText('한국초등배구연맹(KEVF)');
    await page.getByRole('textbox', {name:'영상 제목 검색'}).fill('신강');
    await expect(page.locator('.video-card')).toHaveCount(4);
    await page.getByRole('textbox', {name:'영상 제목 검색'}).fill('');
    await page.getByRole('button', {name:'전체',exact:true}).click();
    await expect(page.locator('.video-card')).toHaveCount(84);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  }
  await page.goto('/#/video/entertainment-02');
  await expect(page.locator('main')).toContainText('업로드 2026-09-29');
  await expect(page.locator('h1')).toContainText('20261011 방송');
  expect(await page.locator('iframe').count()).toBe(0);
  await expect(page.locator('.video-detail-summary')).not.toBeEmpty();
  await page.getByRole('button',{name:/플레이어 열기/}).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/EL_dJjWAXBA?start=0');
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#/videos');
  await page.getByRole('button',{name:'예능배구',exact:true}).click();
  await page.screenshot({path:'artifacts/entertainment-mobile.png',fullPage:false});
  await page.goto('/#/video/elementary-01');
  await expect(page.locator('main')).toContainText('업로드 2026-10-09');
  await expect(page.locator('.video-detail-summary')).toContainText('속공');
  await expect(page.locator('iframe')).toHaveCount(0);
  await page.getByRole('button',{name:/플레이어 열기/}).click();
  await expect(page.locator('iframe')).toHaveAttribute('src','https://www.youtube-nocookie.com/embed/NojNy4z140w?start=0');
  await page.goto('/#/videos');
  await page.getByRole('button',{name:'초등 배구',exact:true}).click();
  await page.screenshot({path:'artifacts/elementary-videos-mobile.png',fullPage:false});
});
test("mobile 360px navigation, routes and no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const route of [
    "home",
    "videos",
    "beginner",
    "skills",
    "skill/spike",
    "positions",
    "quiz",
    "editor",
    "pro",
  ]) {
    await page.goto(`/#/${route}`);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "포지션 배우기" })
    .click();
  await expect(
    page.getByRole("heading", { name: "코트 위, 나의 역할" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "메뉴 열기" })).toBeVisible();
});
test("blocked storage still allows quiz", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("blocked");
    };
  });
  await page.goto("/#/quiz");
  await expect(
    page.getByRole("status").filter({ hasText: "기록을 저장할 수 없어요" }),
  ).toBeVisible();
  await expect(page.locator(".quiz-choices button")).toHaveCount(4);
});
test("save desktop and mobile preview images", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.locator(".quick-skills a").first().waitFor();
  await page.screenshot({ path: "artifacts/home-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/home-mobile.png", fullPage: true });
  await page.goto("/#/positions");
  await page.getByRole("button", { name: "S 세터", exact: true }).waitFor();
  await page.screenshot({
    path: "artifacts/positions-mobile.png",
    fullPage: true,
  });
  await page.goto("/#/pro");
  await expect(page.locator(".video-card")).toHaveCount(10);
  await page.screenshot({ path: "artifacts/videos-mobile.png", fullPage: false });
  await page.goto("/#/skill/dig");
  await expect(page.locator(".video-card")).toHaveCount(8);
  await page.screenshot({ path: "artifacts/skill-videos-mobile.png", fullPage: true });
});

test("built GitHub Pages subpath direct route and reload", async ({ page }) => {
  await page.goto("http://127.0.0.1:5174/volleyball/#/positions");
  await expect(
    page.getByRole("button", { name: "S 세터", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "1번 위치, 선수 1" }),
  ).toBeVisible();
  await page.goto("http://127.0.0.1:5174/volleyball/#/skill/dig");
  await expect(page.locator(".steps li")).toHaveCount(4);
});
test("malformed lesson data and failed network recover independently", async ({
  page,
}) => {
  await page.route("**/data/skills.json", (r) =>
    r.fulfill({ json: [{ id: "bad", name: "자료" }] }),
  );
  await page.route("**/data/videos.json", (r) =>
    r.abort("internetdisconnected"),
  );
  await page.goto("/#/skills");
  await expect(page.getByRole("alert")).toContainText(
    "기술 자료를 불러올 수 없습니다",
  );
  await page.goto("/#/videos");
  await expect(page.getByRole("alert")).toContainText(
    "영상 목록을 불러올 수 없습니다",
  );
  await page.goto("/#/positions");
  await expect(
    page.getByRole("button", { name: "S 세터", exact: true }),
  ).toBeVisible();
});
