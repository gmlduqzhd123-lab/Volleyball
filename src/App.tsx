import { useEffect, useRef, useState } from "react";
import ShareInstall from "./ShareInstall";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Clipboard,
  Download,
  ExternalLink,
  Flag,
  Menu,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  categoryNames,
  videoCategoryTabs,
  filterVideos,
  parseYoutubeUrl,
  positionNames,
  quizScore,
  rotatedPlayers,
  validDate,
  validateLearning,
  validateVideos,
} from "./lib";
import type { Position, Quiz, Rule, Skill, Term, Video } from "./lib";
const officialRules =
  "https://www.fivb.com/wp-content/uploads/2025/01/FIVB-Volleyball_Rules2025_2028-EN-v05.pdf";
const nav = [
  ["home", "홈"],
  ["videos", "배구 영상"],
  ["beginner", "왕초보 배구 교실"],
  ["skills", "배구 기술 교실"],
  ["positions", "포지션 배우기"],
];
function useData<T>(
  name: string,
  validate: (input: unknown) => T[] = (input) =>
    validateLearning(name, input) as T[],
) {
  const [data, setData] = useState<T[]>([]),
    [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    fetch(`${import.meta.env.BASE_URL}data/${name}.json`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw Error("읽기 실패");
        return r.json();
      })
      .then((v) => {
        setData(validate(v));
        setStatus("ready");
      })
      .catch((e) => {
        if (e.name !== "AbortError") setStatus("error");
      });
    return () => controller.abort();
    // Each resource has its own failure state, so another lesson stays usable.
  }, [name, attempt]);
  return { data, status, retry: () => setAttempt((n) => n + 1) };
}
type Resource<T> = ReturnType<typeof useData<T>>;
function DataState({
  resource,
  label,
}: {
  resource: Resource<unknown>;
  label: string;
}) {
  if (resource.status === "loading")
    return (
      <div className="notice" role="status">
        {label} 불러오는 중…
      </div>
    );
  if (resource.status === "error")
    return (
      <div className="notice error" role="alert">
        <strong>{label}{label.endsWith('자료') ? '를' : '을'} 불러올 수 없습니다.</strong>
        <p>
          네트워크 연결이나 데이터 파일을 확인해 주세요. 다른 학습 메뉴는 계속
          이용할 수 있어요.
        </p>
        <button className="button small" onClick={resource.retry}>
          <RotateCcw size={16} />
          다시 시도
        </button>
      </div>
    );
  return null;
}
function LinkButton({
  to,
  children,
  secondary = false,
}: {
  to: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <a className={`button ${secondary ? "secondary" : ""}`} href={`#/${to}`}>
      {children}
      <ArrowRight size={18} />
    </a>
  );
}
function Ball({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 180 180" aria-hidden="true">
      <defs>
        <clipPath id="ballclip">
          <circle cx="90" cy="90" r="85" />
        </clipPath>
      </defs>
      <circle cx="90" cy="90" r="85" fill="#fff7d9" />
      <g clipPath="url(#ballclip)" fill="none" stroke="#194438" strokeWidth="3">
        <path d="M0 62 Q74 7 99 85 Q155 93 157 167 M12 37 Q93 -7 122 85 Q178 114 177 155 M99 85 Q52 141 0 117 M81 61 Q22 75 11 137 M82 61 Q91 135 59 175 M122 85 Q135 42 172 21" />
        <path d="M-5 65 Q61 12 81 61 Q22 75 11 137" fill="#ff865e" />
        <path
          d="M99 85 Q155 93 157 167 L128 181 Q115 132 99 85"
          fill="#efbd44"
        />
      </g>
      <circle
        cx="90"
        cy="90"
        r="85"
        fill="none"
        stroke="#194438"
        strokeWidth="3"
      />
    </svg>
  );
}
function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <span className="art-label">LET’S PLAY TOGETHER</span>
      <div className="art-orbit" />
      <svg className="art-court" viewBox="0 0 500 300">
        <path
          d="M30 260 L170 35 L480 90 L340 290 Z"
          fill="#396f54"
          stroke="#c8d8a5"
          strokeWidth="2"
        />
        <path
          d="M103 145 L407 201 M150 72 L453 130 M65 204 L375 258 M175 38 L345 289"
          stroke="#c8d8a5"
          strokeWidth="2"
        />
        <path
          d="M105 143 L105 69 L409 126 L409 203"
          fill="none"
          stroke="#f5f0cf"
          strokeWidth="4"
        />
        <path
          d="M105 70 L409 126 L409 161 L105 106 Z"
          fill="#173f35"
          stroke="#e5e9cc"
        />
        <path
          d="M105 82 L409 138 M105 94 L409 150 M132 75 L132 111 M165 81 L165 117 M198 87 L198 123 M231 93 L231 129 M264 99 L264 135 M297 105 L297 141 M330 111 L330 147 M363 117 L363 153 M396 123 L396 159"
          stroke="#bacbb0"
          strokeWidth="1"
        />
      </svg>
      <Ball className="hero-ball" />
      <div className="art-badge">
        <Trophy size={18} />
        <span>
          오늘도 한 걸음,
          <br />
          <b>배구왕에 가까이!</b>
        </span>
      </div>
      <span className="art-star star-one">✳</span>
      <span className="art-star star-two">✦</span>
      <span className="art-number">01 / TEAM SPIRIT</span>
    </div>
  );
}
function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-title">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
function EmptyVideos({ reset }: { reset?: () => void }) {
  return (
    <div className="empty">
      <CirclePlay size={38} />
      <h3>
        {reset
          ? "조건에 맞는 영상이 없어요"
          : "우리의 첫 경기를 기다리고 있어요"}
      </h3>
      <p>
        {reset
          ? "검색어나 필터를 바꿔 다시 찾아보세요."
          : "확인된 유튜브 영상을 등록하면 이곳에서 함께 볼 수 있어요."}
      </p>
      {reset ? (
        <button className="button secondary small" onClick={reset}>
          필터 초기화
        </button>
      ) : (
        <span className="muted">
          현재 실제 등록 영상 0개 · 예시 영상은 재생하지 않아요
        </span>
      )}
    </div>
  );
}
function VideoCards({ videos }: { videos: Video[] }) {
  return (
    <div className="video-grid">
      {videos.map((v) => (
        <a
          className="video-card"
          key={v.id}
          href={`#/video/${encodeURIComponent(v.id)}`}
        >
          <div className="thumbnail">
            <img
              loading="lazy"
              src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
              alt=""
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
              }}
            />
            <span className="play-circle">
              <Play size={20} fill="currentColor" />
            </span>
          </div>
          <div className="video-copy">
            <span className="eyebrow">{categoryNames[v.category]}</span>
            <h3>{v.title}</h3>
            <p>
              {v.channel && <>{v.channel}<br /></>}
              {v.uploadDate ? `업로드 ${v.uploadDate.replaceAll("-", ".")}` : v.date.replaceAll("-", ".")}{" "}
              {v.startSeconds > 0 && `· ${v.startSeconds}초부터`}
            </p>
            {v.summary && <p className="video-summary">{v.summary}</p>}
            <div className="tags">
              {(v.skillTags ?? []).map(t => <span key={t}>{t}</span>)}
              {v.positionTags.map((t) => (
                <span key={t}>{positionNames[t]}</span>
              ))}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
function Home({
  videos,
  skills,
}: {
  videos: Resource<Video>;
  skills: Resource<Skill>;
}) {
  const club = filterVideos(videos.data, "", "club").slice(0, 6);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="pill">
            <span />
            선생님들의 즐거운 배구 생활
          </span>
          <h1>
            처음이어도 괜찮아.
            <br />
            우리 모두 <span>배구왕!</span>
          </h1>
          <p>
            함께 뛰는 즐거움, 하나씩 배우는 자신감.
            <br />
            우리의 경기부터 첫 패스까지, 여기서 시작해요.
          </p>
          <div className="hero-actions">
            <LinkButton to="beginner">배구 처음 배우기</LinkButton>
            <a className="text-link" href="#/videos">
              <CirclePlay size={20} />
              배구 영상 보기
            </a>
          </div>
          <div className="hero-bottom">
            <span className="avatar-stack">
              <i>배</i>
              <i>구</i>
              <i>왕</i>
            </span>
            <span>
              같이 배우면, 더 즐거우니까.
              <br />
              <b>교사 배구 동호회를 위한 작은 교실</b>
            </span>
          </div>
        </div>
        <HeroArt />
      </section>
      <div className="values-strip">
        <span>
          <Users size={19} />
          <b>함께 보고</b> 다양한 배구 영상
        </span>
        <span>
          <BookOpen size={19} />
          <b>쉽게 배우고</b> 왕초보도 차근차근
        </span>
        <span>
          <Zap size={19} />
          <b>직접 해보고</b> 코트에서 써먹는 배구
        </span>
      </div>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">START YOUR FIRST RALLY</span>
            <h2>어디서부터 시작할까요?</h2>
          </div>
          <span className="muted desktop-only">
            오늘의 작은 배움이 내일의 좋은 플레이로
          </span>
        </div>
        <div className="journey-grid">
          <a href="#/beginner" className="journey-card mint">
            <span className="card-number">01 / THE BASICS</span>
            <BookOpen size={30} />
            <h3>배구, 처음이라면</h3>
            <p>
              낯선 용어와 규칙을
              <br />
              쉽게 알아보는 왕초보 배구 교실
            </p>
            <span className="card-link">
              왕초보 배구 교실 가기
              <ArrowUpRight size={20} />
            </span>
          </a>
          <a href="#/skills" className="journey-card peach">
            <span className="card-number">02 / THE SKILLS</span>
            <Zap size={30} />
            <h3>한 단계 더 잘하고 싶다면</h3>
            <p>
              패스부터 스파이크까지
              <br />
              코트에서 통하는 기초 기술
            </p>
            <span className="card-link">
              기술 교실 가기
              <ArrowUpRight size={20} />
            </span>
          </a>
          <a href="#/positions" className="journey-card yellow">
            <span className="card-number">03 / YOUR POSITION</span>
            <Flag size={30} />
            <h3>내 자리가 궁금하다면</h3>
            <p>
              우리 팀에서 나의 역할은?
              <br />
              코트 위 포지션과 로테이션
            </p>
            <span className="card-link">
              포지션 배우기
              <ArrowUpRight size={20} />
            </span>
          </a>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OUR MATCHES</span>
            <h2>같이 뛰었던, 그 순간</h2>
          </div>
          <a className="text-link" href="#/videos">
            전체 영상
            <ArrowRight size={17} />
          </a>
        </div>
        <DataState resource={videos} label="영상 목록" />
        {videos.status === "ready" &&
          (club.length ? (
            <VideoCards videos={club} />
          ) : (
            <div className="match-placeholder">
              <div className="placeholder-art">
                <Ball />
                <span className="placeholder-tag">첫 경기 등록 대기</span>
              </div>
              <div>
                <span className="eyebrow">OUR STORY STARTS HERE</span>
                <h3>
                  우리 팀의 멋진 순간을
                  <br />
                  이곳에 모아 볼까요?
                </h3>
                <p>
                  아직 등록된 동호회 영상이 없어요.
                  <br />
                  배구 영상을 날짜와 카테고리로 쉽게 찾아보세요.
                </p>
                <a href="#/videos" className="text-link">
                  배구 영상 둘러보기
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          ))}
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ONE SKILL AT A TIME</span>
            <h2>오늘은 이 기술부터</h2>
          </div>
          <a href="#/skills" className="text-link">
            기술 전체 보기
            <ArrowRight size={17} />
          </a>
        </div>
        <DataState resource={skills} label="기술 자료" />
        <div className="quick-skills">
          {skills.data.map((s, i) => (
            <a href={`#/skill/${s.id}`} key={s.id}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.name}</h3>
              <ArrowUpRight size={18} />
            </a>
          ))}
        </div>
      </section>
      <section className="quiz-banner">
        <div className="quiz-banner-icon">
          <Trophy size={42} />
        </div>
        <div>
          <span className="eyebrow">A LITTLE CHALLENGE</span>
          <h2>배구왕까지, 열 문제!</h2>
          <p>알쏭달쏭 배구 상식, 가볍게 확인해 볼까요?</p>
        </div>
        <LinkButton to="quiz" secondary>
          퀴즈 도전하기
        </LinkButton>
      </section>
    </>
  );
}
function Videos({
  resource,
  pro = false,
}: {
  resource: Resource<Video>;
  pro?: boolean;
}) {
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState(pro ? "pro" : "all"),
    [position, setPosition] = useState("all");
  const list = filterVideos(
    resource.data,
    search,
    category,
    position,
  );
  const filtered = Boolean(
    search || position !== "all" || category !== "all",
  );
  return (
    <>
      <PageTitle
        eyebrow="VOLLEYBALL VIDEOS"
        title="배구 영상"
        description="예능배구부터 기초 영상, 프로팀 경기와 초등 배구까지. 보고 싶은 영상을 찾아보세요."
      />
      <div className="filter-bar">
        <label className="search-field">
          <Search size={19} />
          <input
            aria-label="영상 제목 검색"
            placeholder="어떤 영상을 찾고 있나요?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="select-field">
          포지션
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="all">모든 포지션</option>
            {Object.entries(positionNames).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
        <div className="tabs video-category-tabs" aria-label="영상 카테고리">
          {videoCategoryTabs.map(
            ([id, name]) => (
              <button
                key={id}
                className={category === id ? "active" : ""}
                aria-pressed={category === id}
                onClick={() => setCategory(id)}
              >
                {name}
              </button>
            ),
          )}
        </div>
      <div className="result-count">
        총 <b>{list.length}</b>개 영상<span>최신 날짜순</span>
      </div>
      <DataState resource={resource} label="영상 목록" />
      {resource.status === "ready" &&
        (list.length ? (
          <VideoCards videos={list} />
        ) : (
          <EmptyVideos
            reset={
              filtered
                ? () => {
                    setSearch("");
                    setCategory("all");
                    setPosition("all");
                  }
                : undefined
            }
          />
        ))}
    </>
  );
}
function VideoDetail({
  resource,
  id,
}: {
  resource: Resource<Video>;
  id: string;
}) {
  const [play, setPlay] = useState(false);
  const v = resource.data.find((v) => v.id === id);
  if (resource.status !== "ready")
    return <DataState resource={resource} label="영상 목록" />;
  if (!v)
    return (
      <>
        <PageTitle
          eyebrow="VIDEO"
          title="영상을 찾을 수 없어요"
          description="영상이 삭제되었거나 주소가 변경되었을 수 있어요."
        />
        <LinkButton to="videos">영상 목록으로</LinkButton>
      </>
    );
  return (
    <>
      <a className="back" href="#/videos">
        <ChevronLeft size={16} />
        영상 목록
      </a>
      <PageTitle
        eyebrow={categoryNames[v.category]}
        title={v.title}
        description={v.uploadDate ? `${v.channel ?? ""} · 업로드 ${v.uploadDate}${v.matchDate ? ` · 경기 ${v.matchDate}` : ""}` : `${v.date} · ${v.positionTags.map((t) => positionNames[t]).join(" / ") || "포지션 태그 없음"}`}
      />
      {v.matchInfo && <p>{v.matchInfo}</p>}
      {v.summary && <p className="video-detail-summary">{v.summary}</p>}
      {!!v.skillTags?.length && <div className="tags">{v.skillTags.map(t => <span key={t}>{t}</span>)}</div>}
      <div className="player">
        {play ? (
          <iframe
            title={v.title}
            src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?start=${v.startSeconds}`}
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button className="player-launch" onClick={() => setPlay(true)}>
            <img
              src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`}
              alt=""
            />
            <span>
              <CirclePlay size={56} />
              플레이어 열기{v.startSeconds > 0 && ` · ${v.startSeconds}초 장면`}
            </span>
          </button>
        )}
      </div>
      <div className="player-note">
        <p>재생이 차단되거나 영상이 보이지 않으면 원본에서 확인해 주세요.</p>
        <a
          className="button secondary small"
          href={`https://www.youtube.com/watch?v=${v.youtubeId}&t=${v.startSeconds}s`}
          target="_blank"
          rel="noreferrer"
        >
          유튜브에서 보기
          <ExternalLink size={16} />
        </a>
      </div>
      <h2>함께 볼 영상</h2>
      <VideoCards
        videos={filterVideos(resource.data, "", v.category)
          .filter((other) => other.id !== v.id)
          .slice(0, 3)}
      />
    </>
  );
}
function Beginner({
  terms,
  rules,
}: {
  terms: Resource<Term>;
  rules: Resource<Rule>;
}) {
  const [tab, setTab] = useState("terms"),
    [search, setSearch] = useState(""),
    [topic, setTopic] = useState("all");
  const list = terms.data
    .filter(
      (t) =>
        `${t.name} ${t.summary}`.includes(search.trim()) &&
        (topic === "all" || t.topic === topic),
    )
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
  return (
    <>
      <PageTitle
        eyebrow="VOLLEYBALL, MADE SIMPLE"
        title="왕초보 배구 교실"
        description="처음 듣는 말도, 헷갈리는 규칙도. 하나씩 알아가면 배구가 더 재미있어져요."
      />
      <div className="learning-path">
        <span>
          <b>01</b>용어 알아보기
        </span>
        <ChevronRight size={16} />
        <span>
          <b>02</b>규칙 익히기
        </span>
        <ChevronRight size={16} />
        <a href="#/quiz">
          <b>03</b>퀴즈로 확인하기
          <ArrowUpRight size={16} />
        </a>
      </div>
      <div className="tabs">
        <button
          className={tab === "terms" ? "active" : ""}
          aria-pressed={tab === "terms"}
          onClick={() => setTab("terms")}
        >
          용어 사전
        </button>
        <button
          className={tab === "rules" ? "active" : ""}
          aria-pressed={tab === "rules"}
          onClick={() => setTab("rules")}
        >
          규칙 배우기
        </button>
        <a href="#/quiz">
          배구 퀴즈
          <ArrowUpRight size={15} />
        </a>
      </div>
      {tab === "terms" ? (
        <>
          <div className="filter-bar">
            <label className="search-field">
              <Search size={18} />
              <input
                aria-label="용어 검색"
                placeholder="리시브, 세터… 궁금한 용어를 찾아보세요"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <label className="select-field">
              주제
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="all">모든 주제</option>
                {["공격", "수비", "경기", "기술", "포지션"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <DataState resource={terms} label="용어 사전" />
          <div className="terms-grid">
            {list.map((t) => (
              <article className="term-card" key={t.id}>
                <span className="tag">{t.topic}</span>
                <h3>{t.name}</h3>
                <p>{t.summary}</p>
                <div className="example">
                  <span>쉽게 말하면</span>
                  {t.example}
                </div>
                <a
                  className="text-link"
                  href={
                    t.topic === "포지션"
                      ? "#/positions"
                      : t.topic === "경기"
                        ? "#/quiz"
                        : "#/skills"
                  }
                >
                  관련 학습
                  <ArrowRight size={15} />
                </a>
              </article>
            ))}
          </div>
          {terms.status === "ready" && !list.length && (
            <div className="empty">
              <Search />
              <h3>찾는 용어가 없어요</h3>
              <button
                className="button secondary"
                onClick={() => {
                  setSearch("");
                  setTopic("all");
                }}
              >
                검색 초기화
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="notice">
            <ShieldCheck size={20} />
            <div>
              <b>FIVB 실내 6인제 기본 규칙</b>
              <p>
                동호회·학교·대회 규칙은 다를 수 있어요. 실제 경기에서는 해당
                대회 규정을 확인하세요.
              </p>
              <a href={officialRules} target="_blank" rel="noreferrer">
                FIVB 2025–2028 공식 규정 확인
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
          <DataState resource={rules} label="규칙 자료" />
          <div className="rules-grid">
            {rules.data.map((r) => (
              <article className="rule-card" key={r.id}>
                <span className="rule-symbol">{r.symbol}</span>
                <div>
                  <h3>{r.name}</h3>
                  <p>{r.summary}</p>
                  <div className="example">{r.example}</div>
                </div>
              </article>
            ))}
          </div>
          <div className="section">
            <LinkButton to="positions">코트에서 로테이션 확인하기</LinkButton>
          </div>
        </>
      )}
    </>
  );
}
function Skills({ resource }: { resource: Resource<Skill> }) {
  return (
    <>
      <PageTitle
        eyebrow="BUILD YOUR SKILLS"
        title="배구 기술 교실"
        description="좋은 플레이의 시작은 기본기. 한 동작씩, 내 속도로 배워 보세요."
      />
      <DataState resource={resource} label="기술 자료" />
      <div className="skills-grid">
        {resource.data.map((s, i) => (
          <a className="skill-card" href={`#/skill/${s.id}`} key={s.id}>
            <div className={`skill-illustration skill-tone-${i % 3}`}>
              <span className="skill-index">
                LESSON {String(i + 1).padStart(2, "0")}
              </span>
              <SkillDiagram variant={i} />
            </div>
            <div className="skill-copy">
              <span className="tag">입문</span>
              <h2>{s.name}</h2>
              <p>{s.subtitle}</p>
              <span className="card-link">
                차근차근 배우기
                <ArrowRight size={18} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
function SkillDiagram({ variant = 0 }: { variant?: number }) {
  return (
    <svg
      viewBox="0 0 260 130"
      role="img"
      aria-label="낮은 준비 자세와 공의 움직임 개념도"
    >
      <path
        d="M30 115 H230"
        stroke="#527e68"
        strokeWidth="2"
        strokeDasharray="4 5"
      />
      <circle
        cx="122"
        cy="29"
        r="12"
        fill="#ff966c"
        stroke="#183f34"
        strokeWidth="3"
      />
      <path
        d="M120 43 L110 72 L138 86 M110 72 L86 92 L79 113 M138 86 L156 113 M116 51 L145 65 L181 62 M124 51 L153 62"
        stroke="#183f34"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx={variant % 2 ? 185 : 191}
        cy={variant % 2 ? 24 : 51}
        r="12"
        fill="#f5c754"
        stroke="#183f34"
        strokeWidth="2"
      />
      <path
        d="M189 31 Q174 -1 139 9"
        stroke="#183f34"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
      />
      <path
        d="M146 3 L137 9 L147 14"
        fill="none"
        stroke="#183f34"
        strokeWidth="2"
      />
    </svg>
  );
}
function SkillDetail({
  resource,
  videos,
  id,
}: {
  resource: Resource<Skill>;
  videos: Resource<Video>;
  id: string;
}) {
  const s = resource.data.find((s) => s.id === id);
  if (resource.status !== "ready")
    return <DataState resource={resource} label="기술 자료" />;
  if (!s)
    return (
      <>
        <h1>기술 자료를 찾을 수 없어요</h1>
        <LinkButton to="skills">기술 목록</LinkButton>
      </>
    );
  return (
    <>
      <a className="back" href="#/skills">
        <ChevronLeft size={16} />
        기술 교실
      </a>
      <PageTitle
        eyebrow="STEP BY STEP"
        title={s.name}
        description={s.purpose}
      />
      <div className="lesson-layout">
        <div>
          <div className="notice">
            <b>준비 자세</b>
            <p>{s.preparation}</p>
          </div>
          <h2>이렇게 움직여요</h2>
          <ol className="steps">
            {s.steps.map((step, i) => (
              <li key={step}>
                <span>{i + 1}</span>
                <div>{step}</div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="lesson-aside">
          <SkillDiagram />
          <span className="muted">
            준비 자세 개념도 · 실제 동작은 단계 설명을 참고하세요
          </span>
          <h3>초보자가 자주 하는 실수</h3>
          {s.mistakes.map((m) => (
            <p key={m}>• {m}</p>
          ))}
          <h3>코트 밖에서도 연습해요</h3>
          {s.drills.map((d) => (
            <p key={d}>{d}</p>
          ))}
        </aside>
      </div>
      <section className="section">
        <h2>함께 볼 기술 영상</h2>
        <DataState resource={videos} label="참고 영상" />
        {videos.status === "ready" &&
          (videos.data.some((v) => s.videoIds.includes(v.id)) ? (
            <VideoCards
              videos={videos.data.filter((v) => s.videoIds.includes(v.id))}
            />
          ) : (
            <div className="notice">
              확인된 참고 영상은 아직 준비 중이에요. 위의 동작과 연습법부터
              차근차근 익혀 보세요.
            </div>
          ))}
      </section>
    </>
  );
}
function Positions({ resource }: { resource: Resource<Position> }) {
  const [selected, setSelected] = useState("setter"),
    [turn, setTurn] = useState(0),
    [spot, setSpot] = useState(1);
  const p = resource.data.find((p) => p.id === selected);
  const players = rotatedPlayers(turn);
  const coords = [
    [330, 280],
    [330, 120],
    [220, 120],
    [110, 120],
    [110, 280],
    [220, 280],
  ];
  return (
    <>
      <PageTitle
        eyebrow="FIND YOUR PLACE"
        title="코트 위, 나의 역할"
        description="여섯 개의 자리, 다섯 가지 역할. 팀워크는 서로의 자리를 이해하는 것부터 시작해요."
      />
      <DataState resource={resource} label="포지션 자료" />
      <div className="position-layout">
        <section className="court-panel">
          <div className="section-heading">
            <h2>로테이션을 눈으로 익혀요</h2>
            <span className="tag">6인제</span>
          </div>
          <p>서브권을 새로 얻으면, 시계 방향으로 한 자리.</p>
          <svg
            className="court"
            viewBox="0 0 440 390"
            role="group"
            aria-label="배구 코트 로테이션 위치, 번호를 선택해 보세요"
          >
            <rect
              x="50"
              y="65"
              width="340"
              height="270"
              rx="3"
              fill="#e5ead7"
              stroke="#5b8168"
              strokeWidth="3"
            />
            <rect x="50" y="65" width="340" height="92" fill="#d0dfba" />
            <path d="M50 157 H390" stroke="#fff" strokeWidth="3" />
            <path d="M40 57 H400" stroke="#183f35" strokeWidth="5" />
            <text x="220" y="33" textAnchor="middle">
              네트 / 상대 코트
            </text>
            <text x="220" y="191" textAnchor="middle" className="court-label">
              공격선 · 네트에서 3m
            </text>
            <text
              x="23"
              y="125"
              className="court-label"
              transform="rotate(-90 23 125)"
            >
              전위
            </text>
            <text
              x="23"
              y="285"
              className="court-label"
              transform="rotate(-90 23 285)"
            >
              후위
            </text>
            {coords.map(([x, y], i) => (
              <g
                key={i}
                role="button"
                tabIndex={0}
                aria-label={`${i + 1}번 위치, 선수 ${players[i]}`}
                aria-pressed={spot === i + 1}
                onClick={() => setSpot(i + 1)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSpot(i + 1);
                  }
                }}
                className="court-spot"
              >
                <circle
                  cx={x}
                  cy={y}
                  r="25"
                  fill={spot === i + 1 ? "#194a3a" : "#fffef3"}
                  stroke="#194a3a"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y + 6}
                  textAnchor="middle"
                  fill={spot === i + 1 ? "white" : "#194a3a"}
                >
                  {i + 1}
                </text>
                <text
                  x={x}
                  y={y + 45}
                  textAnchor="middle"
                  className="player-label"
                >
                  선수 {players[i]}
                </text>
              </g>
            ))}
            <text x="220" y="370" textAnchor="middle" className="court-label">
              우리 코트 · 엔드라인
            </text>
          </svg>
          <div className="rotation-controls">
            <button
              className="button small secondary"
              onClick={() => {
                setTurn(0);
                setSpot(1);
              }}
              aria-label="로테이션 처음으로"
            >
              <RotateCcw size={17} />
            </button>
            <span aria-live="polite">{turn} / 6 회전</span>
            <button
              className="button small"
              onClick={() => setTurn((n) => (n + 1) % 7)}
            >
              다음 위치
              <RotateCcw size={17} />
            </button>
          </div>
          <p className="court-caption" aria-live="polite">
            <b>{spot}번</b>은 {spot >= 2 && spot <= 4 ? "전위" : "후위"} 위치
            {spot === 1 ? "이며 서브 순서의 자리예요." : "예요."} 현재 선수{" "}
            {players[spot - 1]}이 있어요.
          </p>
        </section>
        <section className="roles-panel">
          <h2>나는 어떤 역할을 할까요?</h2>
          <div className="role-buttons">
            {resource.data.map((p) => (
              <button
                key={p.id}
                aria-pressed={selected === p.id}
                className={selected === p.id ? "active" : ""}
                onClick={() => setSelected(p.id)}
              >
                {p.abbreviation}
                <span>{p.name}</span>
              </button>
            ))}
          </div>
          {p && (
            <div className="role-description">
              <span className="eyebrow">{p.subtitle}</span>
              <h2>{p.name}</h2>
              <h3>이런 일을 해요</h3>
              <ul>
                {p.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <h3>처음 시작하는 나에게</h3>
              <ul>
                {p.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
      <div className="notice">
        <Flag size={20} />
        <div>
          <b>위치 번호와 전문 포지션은 다른 개념이에요.</b>
          <p>
            1~6번은 로테이션 자리, 세터·리베로 등은 선수의 역할이에요.
            시뮬레이션의 ‘선수 1~6’은 이동을 보여 주는 예시이며 역할 배치가
            아닙니다. 실제 수비 배치와 리베로 교대는 따로 적용해요.
          </p>
        </div>
      </div>
    </>
  );
}
function QuizPage({ resource }: { resource: Resource<Quiz> }) {
  const [answers, setAnswers] = useState<number[]>([]),
    [choice, setChoice] = useState<number | null>(null),
    [submitted, setSubmitted] = useState(false),
    [finished, setFinished] = useState(false),
    [storage, setStorage] = useState("");
  const [previous, setPrevious] = useState("");
  useEffect(() => {
    try {
      const value = localStorage.getItem("volleyball-quiz-result");
      if (value) {
        const r = JSON.parse(value);
        if (typeof r.score === "number" && typeof r.total === "number")
          setPrevious(`지난 기록 ${r.score} / ${r.total}점`);
      }
    } catch {
      setStorage(
        "이 브라우저에서는 기록을 저장할 수 없어요. 퀴즈는 계속 풀 수 있습니다.",
      );
    }
  }, []);
  const questions = resource.data;
  const q = questions[answers.length];
  function next() {
    const updated = [...answers, choice!];
    setAnswers(updated);
    setChoice(null);
    setSubmitted(false);
    if (updated.length === questions.length) {
      setFinished(true);
      try {
        localStorage.setItem(
          "volleyball-quiz-result",
          JSON.stringify({
            score: quizScore(questions, updated),
            total: questions.length,
            completedAt: new Date().toISOString(),
          }),
        );
      } catch {
        setStorage(
          "기록을 저장하지 못했지만 결과는 아래에서 확인할 수 있어요.",
        );
      }
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="CHALLENGE YOURSELF"
        title="배구왕까지, 열 문제!"
        description="틀려도 괜찮아요. 정답의 이유를 알아 가는 게 오늘의 목표니까요."
      />
      <DataState resource={resource} label="퀴즈 자료" />
      {storage && (
        <div role="status" className="notice">
          {storage}
        </div>
      )}
      {resource.status === "ready" &&
        (!questions.length ? (
          <div className="empty">퀴즈가 아직 준비되지 않았어요.</div>
        ) : finished ? (
          <section className="quiz-result">
            <Trophy size={55} />
            <h2>첫 랠리, 멋지게 완료!</h2>
            <p className="score">
              {quizScore(questions, answers)}
              <span> / {questions.length}</span>
            </p>
            <p>완료 기록은 이 브라우저에만 저장돼요.</p>
            <div className="result-review">
              {questions.map((q, i) => (
                <div key={q.id}>
                  <span
                    className={
                      answers[i] === q.correctIndex ? "correct" : "incorrect"
                    }
                  >
                    {answers[i] === q.correctIndex ? "정답" : "다시 알아보기"}
                  </span>
                  <h3>
                    {i + 1}. {q.question}
                  </h3>
                  <p>정답: {q.choices[q.correctIndex]}</p>
                  <p>{q.explanation}</p>
                </div>
              ))}
            </div>
            <button
              className="button"
              onClick={() => {
                setAnswers([]);
                setChoice(null);
                setSubmitted(false);
                setFinished(false);
              }}
            >
              다시 풀기
              <RotateCcw size={18} />
            </button>
          </section>
        ) : (
          q && (
            <section className="quiz-card">
              <div className="quiz-progress">
                <span>
                  QUESTION {String(answers.length + 1).padStart(2, "0")}
                </span>
                <span>
                  {answers.length + 1} / {questions.length}
                </span>
              </div>
              <progress
                value={answers.length}
                max={questions.length}
                aria-label="퀴즈 진행률"
              />
              <h2>{q.question}</h2>
              <div className="quiz-choices">
                {q.choices.map((c, i) => (
                  <button
                    key={c}
                    disabled={submitted}
                    className={`${choice === i ? "selected" : ""} ${submitted && i === q.correctIndex ? "right-answer" : ""}`}
                    aria-pressed={choice === i}
                    onClick={() => setChoice(i)}
                  >
                    <span>{i + 1}</span>
                    {c}
                    {submitted && i === q.correctIndex && <Check size={20} />}
                  </button>
                ))}
              </div>
              {submitted ? (
                <>
                  <div
                    className={`answer-explanation ${choice === q.correctIndex ? "correct" : "incorrect"}`}
                    role="status"
                  >
                    <b>
                      {choice === q.correctIndex
                        ? "정답이에요!"
                        : "다음에는 기억할 수 있어요."}
                    </b>
                    <p>{q.explanation}</p>
                  </div>
                  <button className="button" onClick={next}>
                    {answers.length === questions.length - 1
                      ? "결과 보기"
                      : "다음 문제"}
                    <ArrowRight size={18} />
                  </button>
                </>
              ) : (
                <button
                  className="button"
                  disabled={choice === null}
                  onClick={() => setSubmitted(true)}
                >
                  정답 확인
                  <Check size={18} />
                </button>
              )}
              <p className="muted">
                {previous || "완료 기록은 이 브라우저에만 저장됩니다."}
              </p>
            </section>
          )
        ))}
    </>
  );
}
function Editor({ videos }: { videos: Resource<Video> }) {
  const [url, setUrl] = useState(""),
    [title, setTitle] = useState(""),
    [date, setDate] = useState(""),
    [category, setCategory] = useState<Video["category"]>("club"),
    [tags, setTags] = useState<string[]>([]),
    [start, setStart] = useState("0"),
    [output, setOutput] = useState(""),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [message, setMessage] = useState("");
  function generate(e: React.FormEvent) {
    e.preventDefault();
    const problems: Record<string, string> = {};
    const id = parseYoutubeUrl(url);
    if (!id)
      problems.url =
        "youtube.com/watch, youtu.be, Shorts의 올바른 영상 링크를 입력하세요.";
    if (!title.trim()) problems.title = "영상 제목을 입력하세요.";
    if (!validDate(date))
      problems.date = "실제 날짜를 YYYY-MM-DD 형식으로 입력하세요.";
    if (!/^\d+$/.test(start) || !Number.isSafeInteger(Number(start)))
      problems.start = "장면 시작은 0 이상의 정수 초로 입력하세요.";
    setErrors(problems);
    setMessage("");
    if (Object.keys(problems).length) {
      setOutput("");
      return;
    }
    const item: Video = {
      id: `vol-${crypto.randomUUID().slice(0, 8)}`,
      youtubeId: id!,
      title: title.trim(),
      date,
      category,
      positionTags: tags,
      startSeconds: Number(start),
    };
    setOutput(JSON.stringify(item, null, 2));
  }
  function download() {
    const data = JSON.parse(output) as Video;
    const blob = new Blob([JSON.stringify([data], null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "video-entry.json";
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage(
      "영상 1개를 담은 배열 파일을 내려받았습니다. 기존 videos.json에 병합해 주세요.",
    );
  }
  return (
    <>
      <PageTitle
        eyebrow="LOCAL CONTENT TOOL"
        title="관리자 JSON 보조 도구"
        description="영상 정보를 입력하고, 정적 데이터 파일에 추가할 항목을 만드세요."
      />
      <div className="notice">
        <ShieldCheck size={22} />
        <div>
          <b>인증 기능이 없는 로컬 편집 도구입니다.</b>
          <p>
            입력은 서버에 전송되지 않으며 공개 목록도 바뀌지 않습니다. 생성한
            항목을 관리자가 public/data/videos.json에 병합하고 저장소에
            반영·배포해야 공유됩니다. 다운로드 파일로 기존 목록을 덮어쓰지
            마세요.
          </p>
        </div>
      </div>
      <div className="editor-layout">
        <form onSubmit={generate} noValidate className="editor-form">
          <label>
            유튜브 링크
            <input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setOutput("");
              }}
              placeholder="https://www.youtube.com/watch?v=…"
              aria-invalid={!!errors.url}
              aria-describedby="url-error"
            />
            {errors.url && (
              <span id="url-error" className="field-error">
                {errors.url}
              </span>
            )}
          </label>
          <label>
            영상 제목
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setOutput("");
              }}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <span className="field-error">{errors.title}</span>
            )}
          </label>
          <label>
            경기 날짜
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setOutput("");
              }}
              aria-invalid={!!errors.date}
            />
            {errors.date && <span className="field-error">{errors.date}</span>}
          </label>
          <label>
            카테고리
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as Video["category"]);
                setOutput("");
              }}
            >
              {Object.entries(categoryNames).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>포지션 태그 · 여러 개 선택 가능</legend>
            {Object.entries(positionNames).map(([id, name]) => (
              <label className="checkbox-label" key={id}>
                <input
                  type="checkbox"
                  checked={tags.includes(id)}
                  onChange={() => {
                    setTags((t) =>
                      t.includes(id) ? t.filter((v) => v !== id) : [...t, id],
                    );
                    setOutput("");
                  }}
                />
                {name}
              </label>
            ))}
          </fieldset>
          <label>
            장면 시작 시간 (초)
            <input
              type="number"
              min="0"
              step="1"
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                setOutput("");
              }}
              aria-invalid={!!errors.start}
            />
            {errors.start && (
              <span className="field-error">{errors.start}</span>
            )}
          </label>
          <button className="button" type="submit">
            JSON 생성
            <ArrowRight size={18} />
          </button>
        </form>
        <section className="json-panel">
          <h2>생성된 영상 항목</h2>
          <p className="muted">
            공유 동의, 공개 범위, 임베드 재생 가능 여부는 실제 영상에서 확인해
            주세요.
          </p>
          <pre tabIndex={0}>
            {output || "입력을 완료하면 JSON이 여기에 표시됩니다."}
          </pre>
          <div className="editor-actions">
            <button
              className="button small secondary"
              disabled={!output}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(output);
                  setMessage("JSON 항목을 복사했습니다.");
                } catch {
                  setMessage(
                    "복사 권한이 없습니다. 아래 JSON을 직접 선택하거나 파일을 내려받으세요.",
                  );
                }
              }}
            >
              <Clipboard size={16} />
              복사
            </button>
            <button
              className="button small"
              disabled={!output}
              onClick={download}
            >
              <Download size={16} />
              JSON 다운로드
            </button>
          </div>
          <p role="status">{message}</p>
          <p className="muted">
            현재 공개 데이터:{" "}
            {videos.status === "ready"
              ? `${videos.data.length}개`
              : "확인 불가"}
          </p>
        </section>
      </div>
    </>
  );
}
export default function App() {
  const [route, setRoute] = useState(location.hash.slice(2) || "home"),
    [menu, setMenu] = useState(false);
  const main = useRef<HTMLElement>(null);
  const videos = useData<Video>("videos", validateVideos),
    terms = useData<Term>("terms"),
    skills = useData<Skill>("skills"),
    positions = useData<Position>("positions"),
    quizzes = useData<Quiz>("quizzes"),
    rules = useData<Rule>("rules");
  useEffect(() => {
    const update = () => {
      setRoute(location.hash.slice(2) || "home");
      setMenu(false);
      window.scrollTo(0, 0);
      requestAnimationFrame(() => main.current?.focus());
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  const [page, rawId] = route.split("/");
  let id = "";
  try {
    id = decodeURIComponent(rawId || "");
  } catch {
    /* Invalid URL becomes a not-found view. */
  }
  useEffect(() => {
    document.title = `${nav.find((n) => n[0] === (page === "pro" ? "videos" : page))?.[1] || "배구 배우기"} | 우리 모두 배구왕`;
  }, [page]);
  let content: React.ReactNode;
  switch (page) {
    case "home":
      content = <Home videos={videos} skills={skills} />;
      break;
    case "videos":
      content = <Videos key="videos" resource={videos} />;
      break;
    case "pro":
      content = <Videos key="pro" resource={videos} pro />;
      break;
    case "video":
      content = <VideoDetail key={id} resource={videos} id={id} />;
      break;
    case "beginner":
      content = <Beginner terms={terms} rules={rules} />;
      break;
    case "skills":
      content = <Skills resource={skills} />;
      break;
    case "skill":
      content = <SkillDetail resource={skills} videos={videos} id={id} />;
      break;
    case "positions":
      content = <Positions resource={positions} />;
      break;
    case "quiz":
      content = <QuizPage resource={quizzes} />;
      break;
    case "editor":
      content = <Editor videos={videos} />;
      break;
    default:
      content = (
        <>
          <PageTitle
            eyebrow="404"
            title="이 페이지는 코트 밖이에요"
            description="주소를 확인하거나 홈에서 다시 시작해 주세요."
          />
          <LinkButton to="home">홈으로 가기</LinkButton>
        </>
      );
  }
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        본문으로 바로가기
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#/home" aria-label="우리 모두 배구왕 홈">
            <span className="brand-mark">
              <Ball />
            </span>
            <span>
              우리 모두 <b>배구왕</b>
              <small>VOLLEYBALL FOR EVERYONE</small>
            </span>
          </a>
          <nav
            id="main-nav"
            className={menu ? "open" : ""}
            aria-label="주요 메뉴"
          >
            {nav.map(([path, label]) => (
              <a
                key={path}
                href={`#/${path}`}
                onClick={() => setMenu(false)}
                className={
                  page === path ||
                  (path === "videos" && page === "pro") ||
                  (path === "skills" && page === "skill") ||
                  (path === "videos" && page === "video")
                    ? "active"
                    : ""
                }
                aria-current={(page === "pro" ? "videos" : page) === path ? "page" : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button type="button" className="app-chip install" data-ys-install="">
              📲 <span className="chip-wide">앱 </span>설치
            </button>
            <button type="button" className="app-chip" data-qr="" aria-label="QR 코드로 접속">
              📱 QR
            </button>
            <button
              className="menu-toggle"
              aria-expanded={menu}
              aria-controls="main-nav"
              aria-label={menu ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setMenu((m) => !m)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main
        id="main"
        tabIndex={-1}
        ref={main}
        className="container"
        key={route}
      >
        {content}
      </main>
      <footer className="site-footer">
        <ShareInstall />
        <div className="footer-inner">
          <div>
            <a className="brand" href="#/home">
              <span className="brand-mark">
                <Ball />
              </span>
              <span>
                우리 모두 <b>배구왕</b>
              </span>
            </a>
            <p>함께 배우고, 함께 뛰어요. 우리의 즐거운 배구 생활.</p>
          </div>
          <div className="footer-links">
            <a href={officialRules} target="_blank" rel="noreferrer">
              공식 규정
              <ExternalLink size={13} />
            </a>
            <a href="#/editor">관리자 JSON 도구</a>
            <span>교사 배구 동호회 · MVP</span>
          </div>
        </div>
        <div className="copyright">
          <p>
            © 2026 엽쌤. All rights reserved. ·{" "}
            <a className="hub-link" href="https://gmlduqzhd123-lab.github.io/YScode/">엽쌤의 다른 앱 보기 →</a>
          </p>
          <p>유튜브 영상 등 외부 콘텐츠의 저작권은 각 원저작자에게 있습니다.</p>
        </div>
      </footer>
    </>
  );
}
