import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  parseYoutubeUrl,
  validDate,
  validateVideos,
  filterVideos,
  rotatedPlayers,
  quizScore,
} from "../src/lib";
import type { Video, Quiz } from "../src/lib";
const video: Video = {
  id: "v1",
  youtubeId: "M7lc1UVf-VE",
  title: "첫 경기",
  date: "2026-10-12",
  category: "club",
  positionTags: ["setter"],
  startSeconds: 35,
};
describe("YouTube links", () => {
  it.each([
    "https://www.youtube.com/watch?v=M7lc1UVf-VE&t=35",
    "https://youtu.be/M7lc1UVf-VE?si=test",
    "https://www.youtube.com/shorts/M7lc1UVf-VE",
    "https://m.youtube.com/watch?v=M7lc1UVf-VE",
  ])("accepts %s", (url) => expect(parseYoutubeUrl(url)).toBe(video.youtubeId));
  it.each([
    "javascript:alert(1)",
    "https://youtube.com.evil.com/watch?v=M7lc1UVf-VE",
    "https://evil.com/watch?v=M7lc1UVf-VE",
    "https://youtube.com/watch?v=abc",
    "https://user:password@youtube.com/watch?v=M7lc1UVf-VE",
    "M7lc1UVf-VE",
  ])("rejects %s", (url) => expect(parseYoutubeUrl(url)).toBeNull());
});
describe("metadata validation and filtering", () => {
  it("accepts empty real video data", () =>
    expect(validateVideos([])).toEqual([]));
  it("accepts complete item", () =>
    expect(validateVideos([video])).toEqual([video]));
  it.each([
    { date: "2026-02-30" },
    { startSeconds: -1 },
    { startSeconds: 0.5 },
    { positionTags: ["unknown"] },
    { category: "unknown" },
    { title: "" },
    { youtubeId: "evil" },
  ])("rejects malformed metadata %j", (patch) =>
    expect(() => validateVideos([{ ...video, ...patch }])).toThrow(),
  );
  it("rejects duplicate ids and malformed root", () => {
    expect(() => validateVideos([video, video])).toThrow();
    expect(() => validateVideos({})).toThrow();
  });
  it("supports leap dates", () => {
    expect(validDate("2024-02-29")).toBe(true);
    expect(validDate("2025-02-29")).toBe(false);
  });
  it("sorts newest first and combines all filters", () => {
    const old = {
      ...video,
      id: "v2",
      date: "2026-01-01",
      category: "pro" as const,
      title: "프로 경기",
      positionTags: ["libero"],
    };
    expect(filterVideos([old, video]).map((v) => v.id)).toEqual(["v1", "v2"]);
    expect(filterVideos([old, video], "경기", "pro", "libero")).toEqual([old]);
    expect(filterVideos([old, video], "없는 제목")).toEqual([]);
  });
});
describe("learning data", () => {
  it("entertainment sources are unique, recent, described and locally playable", () => {
    const all=validateVideos(JSON.parse(readFileSync('public/data/videos.json','utf8')));
    const videos=all.filter(v=>v.category==='entertainment');
    const playback=JSON.parse(readFileSync('docs/entertainment-playback-local.json','utf8'));
    expect(videos).toHaveLength(10);
    expect(new Set(all.map(v=>v.youtubeId)).size).toBe(all.length);
    for(const v of videos){
      expect(v.uploadDate! >= '2023-10-12' && v.uploadDate! <= '2026-10-12').toBe(true);
      expect(v.channel).toBe('원더독스 라커룸');
      expect(v.summary!.length).toBeGreaterThan(40);
      expect(v.date).toBe(v.uploadDate);
      expect(parseYoutubeUrl(v.sourceUrl!)).toBe(v.youtubeId);
      const r=playback.find((r:{id:string})=>r.id===v.id);
      expect(r?.passed).toBe(true);
      expect(r.youtubeId).toBe(v.youtubeId);
      for(const state of [r.before,r.after]){expect(state.paused).toBe(false);expect(state.adShowing).toBe(false);}
      expect(r.after.time).toBeGreaterThan(r.before.time+0.5);
    }
  });
  it("catalog has unique recent sources, descriptions, successful playback and complete skill links", () => {
    const videos = validateVideos(JSON.parse(readFileSync("public/data/videos.json", "utf8"))).filter(v => v.category !== "entertainment");
    const playback = JSON.parse(readFileSync("docs/video-playback-local.json", "utf8"));
    const livePlayback = JSON.parse(readFileSync("docs/video-playback-live.json", "utf8"));
    const skills = JSON.parse(readFileSync("public/data/skills.json", "utf8"));
    expect(videos).toHaveLength(64);
    expect(new Set(videos.map(v => v.youtubeId)).size).toBe(videos.length);
    for(const v of videos) {
      expect(v.uploadDate! >= "2023-10-12" && v.uploadDate! <= "2026-10-12").toBe(true);
      expect(v.channel?.length).toBeGreaterThan(0);
      expect(v.summary?.length).toBeGreaterThan(20);
      expect(parseYoutubeUrl(v.sourceUrl!)).toBe(v.youtubeId);
      expect(playback.find((r: {id:string; passed:boolean}) => r.id === v.id)?.passed).toBe(true);
      for (const rows of [playback, livePlayback]) {
        const record = rows.find((r: {id:string}) => r.id === v.id);
        expect(record?.youtubeId).toBe(v.youtubeId);
        expect(record?.passed).toBe(true);
        expect(record.before.adShowing).toBe(false);
        expect(record.after.adShowing).toBe(false);
        expect(record.before.paused).toBe(false);
        expect(record.after.paused).toBe(false);
        expect(record.after.time).toBeGreaterThan(record.before.time + 0.5);
      }
      if(v.category === "skill") expect(skills.filter((s: {videoIds:string[]}) => s.videoIds.includes(v.id))).toHaveLength(1);
    }
    for(const s of skills) for(const id of s.videoIds) expect(videos.some(v => v.id === id)).toBe(true);
  });
  it("rotates clockwise 2 to 1 and returns after six", () => {
    expect(rotatedPlayers(1)).toEqual([2, 3, 4, 5, 6, 1]);
    expect(rotatedPlayers(6)).toEqual(rotatedPlayers(0));
  });
  it("each player visits all six fixed spots", () => {
    expect(
      new Set(
        Array.from({ length: 6 }, (_, turn) => rotatedPlayers(turn).indexOf(1)),
      ).size,
    ).toBe(6);
  });
  it("all quiz questions have four choices and a valid answer", () => {
    const qs = JSON.parse(
      readFileSync("public/data/quizzes.json", "utf8").replace(/^\uFEFF/, ""),
    ) as Quiz[];
    expect(qs).toHaveLength(10);
    for (const q of qs) {
      expect(q.choices).toHaveLength(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanation.length).toBeGreaterThan(5);
    }
    expect(
      quizScore(
        qs,
        qs.map((q) => q.correctIndex),
      ),
    ).toBe(10);
    expect(
      quizScore(
        qs,
        qs.map((q) => (q.correctIndex + 1) % 4),
      ),
    ).toBe(0);
  });
  it("JSON ids are unique and all learning links reference existing videos", () => {
    const vids = validateVideos(
      JSON.parse(
        readFileSync("public/data/videos.json", "utf8").replace(/^\uFEFF/, ""),
      ),
    );
    for (const name of ["terms", "skills", "positions", "rules", "quizzes"]) {
      const rows = JSON.parse(
        readFileSync(`public/data/${name}.json`, "utf8").replace(/^\uFEFF/, ""),
      );
      expect(new Set(rows.map((r: any) => r.id)).size).toBe(rows.length);
      for (const row of rows)
        for (const id of row.videoIds || [])
          expect(vids.some((v) => v.id === id)).toBe(true);
    }
  });
});
