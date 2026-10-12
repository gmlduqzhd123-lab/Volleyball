export type Video = {
  id: string;
  youtubeId: string;
  title: string;
  date: string;
  category: "club" | "skill" | "pro" | "entertainment" | "elementary";
  positionTags: string[];
  startSeconds: number;
  uploadDate?: string;
  matchDate?: string;
  channel?: string;
  summary?: string;
  sourceUrl?: string;
  skillTags?: string[];
  matchInfo?: string;
};
export type Term = {
  id: string;
  name: string;
  topic: string;
  summary: string;
  example: string;
  videoIds: string[];
};
export type Skill = {
  id: string;
  name: string;
  subtitle: string;
  purpose: string;
  preparation: string;
  steps: string[];
  mistakes: string[];
  drills: string[];
  videoIds: string[];
};
export type Position = {
  id: string;
  name: string;
  abbreviation: string;
  subtitle: string;
  responsibilities: string[];
  tips: string[];
};
export type Quiz = {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};
export type Rule = {
  id: string;
  name: string;
  summary: string;
  example: string;
  symbol: string;
};
export const positionNames: Record<string, string> = {
  setter: "세터",
  outside: "아웃사이드 히터",
  opposite: "아포짓",
  middle: "미들 블로커",
  libero: "리베로",
};
export const categoryNames = {
  club: "우리 동호회",
  skill: "기초 영상",
  pro: "프로팀 경기",
  entertainment: "예능배구",
  elementary: "초등 배구",
};
// Retain the club data category; its videos remain discoverable through All.
export const videoCategoryTabs = [
  ["all", "전체"],
  ["entertainment", "예능배구"],
  ["skill", "기초 영상"],
  ["pro", "프로팀 경기"],
  ["elementary", "초등 배구"],
] as const;
export function parseYoutubeUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.split("/")[1];
    else if (
      ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)
    ) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else if (/^\/(shorts|embed|live)\//.test(url.pathname))
        id = url.pathname.split("/")[2];
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
export function validDate(value: string): boolean {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function validateVideos(data: unknown): Video[] {
  if (!Array.isArray(data))
    throw new Error("영상 목록 형식이 올바르지 않습니다.");
  const ids = new Set<string>();
  return data.map((v: unknown) => {
    const row = v as Video;
    if (
      !row ||
      typeof row.id !== "string" ||
      !row.id.trim() ||
      ids.has(row.id) ||
      typeof row.title !== "string" ||
      !row.title.trim() ||
      !/^[\w-]{11}$/.test(row.youtubeId) ||
      !validDate(row.date) ||
      !Object.keys(categoryNames).includes(row.category) ||
      !Array.isArray(row.positionTags) ||
      row.positionTags.some((t) => !Object.keys(positionNames).includes(t)) ||
      !Number.isInteger(row.startSeconds) ||
      row.startSeconds < 0
      || (row.uploadDate !== undefined && !validDate(row.uploadDate))
      || (row.matchDate !== undefined && !validDate(row.matchDate))
      || [row.channel, row.summary, row.sourceUrl, row.matchInfo].some(value => value !== undefined && typeof value !== "string")
      || (row.sourceUrl !== undefined && parseYoutubeUrl(row.sourceUrl) !== row.youtubeId)
      || (row.skillTags !== undefined && (!Array.isArray(row.skillTags) || row.skillTags.some(tag => typeof tag !== "string")))
    )
      throw new Error("영상 항목을 확인해 주세요.");
    ids.add(row.id);
    return row;
  });
}
export function filterVideos(
  videos: Video[],
  search = "",
  category = "all",
  position = "all",
) {
  return videos
    .filter(
      (v) =>
        `${v.title} ${v.channel ?? ""} ${v.summary ?? ""} ${(v.skillTags ?? []).join(" ")}`.toLowerCase().includes(search.trim().toLowerCase()) &&
        (category === "all" || v.category === category) &&
        (position === "all" || v.positionTags.includes(position)),
    )
    .sort((a, b) => (b.uploadDate ?? b.date).localeCompare(a.uploadDate ?? a.date) || a.id.localeCompare(b.id));
}
// Fixed court positions 1..6; moving clockwise sends 2 → 1 → 6 → 5 → 4 → 3 → 2.
export function rotatedPlayers(turn: number): number[] {
  return Array.from({ length: 6 }, (_, i) => ((i + turn) % 6) + 1);
}
export function quizScore(questions: Quiz[], answers: number[]): number {
  return questions.reduce(
    (total, q, i) => total + Number(q.correctIndex === answers[i]),
    0,
  );
}
export function validateLearning(name: string, input: unknown): unknown[] {
  const strings = (value: unknown) =>
    Array.isArray(value) && value.every((item) => typeof item === "string");
  if (!Array.isArray(input)) throw Error("학습 데이터 형식 오류");
  const ids = new Set<string>();
  for (const row of input) {
    if (!row || typeof row.id !== "string" || !row.id || ids.has(row.id))
      throw Error("학습 항목 오류");
    ids.add(row.id);
    if (name === "quizzes") {
      if (
        typeof row.question !== "string" ||
        !strings(row.choices) ||
        row.choices.length !== 4 ||
        !Number.isInteger(row.correctIndex) ||
        row.correctIndex < 0 ||
        row.correctIndex > 3 ||
        typeof row.explanation !== "string"
      )
        throw Error("퀴즈 항목 오류");
    } else {
      if (typeof row.name !== "string") throw Error("이름 오류");
      const fields: Record<string, string[]> = {
        terms: ["topic", "summary", "example"],
        skills: ["subtitle", "purpose", "preparation"],
        positions: ["abbreviation", "subtitle"],
        rules: ["summary", "example", "symbol"],
      };
      const lists: Record<string, string[]> = {
        terms: ["videoIds"],
        skills: ["steps", "mistakes", "drills", "videoIds"],
        positions: ["responsibilities", "tips"],
        rules: [],
      };
      if (
        !fields[name] ||
        fields[name].some((key) => typeof row[key] !== "string") ||
        lists[name].some((key) => !strings(row[key]))
      )
        throw Error("학습 내용 오류");
    }
  }
  return input;
}
