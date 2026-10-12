# 우리 모두 배구왕

교사 배구 동호회와 입문자를 위한 반응형 정적 웹앱 MVP입니다. React + Vite + TypeScript로 구현했으며 별도 서버, DB, 로그인 없이 GitHub Pages에 배포할 수 있습니다.

## 시작하기

Node.js 24 LTS와 npm을 사용합니다.

```sh
npm ci
npm run dev
```

터미널의 로컬 주소(기본 http://127.0.0.1:5173)를 여세요. HTML 파일을 직접 더블클릭하면 JSON 로딩이 동작하지 않습니다.

```sh
npm test          # URL 검사, 데이터 검증, 필터, 회전, 채점
npm run build    # TypeScript 검사 및 dist 생성
npm run preview  # 배포용 빌드 로컬 확인
```

브라우저 검증은 Chromium이 필요합니다.

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

## 구현 범위

- 홈: 입문 안내, 실제 등록 영상 최신 6개, 기초 기술 바로가기, 퀴즈.
- 영상관: 제목 검색, 카테고리·포지션 필터, 날짜순 정렬, 상세 화면, 클릭 후 iframe 생성, 원본 유튜브 링크, 장면 시작 시각.
- 왕초보 교실: 용어 12개 가나다순 검색과 주제 필터, 규칙 카드 6개, 공식 규정 링크.
- 기술 교실: 언더핸드 패스·오버핸드 패스·서브·스파이크·블로킹·디그 6종. 준비 자세, 3~5단계 설명, 실수, 혼자/둘 연습법.
- 포지션 교실: 다섯 가지 전문 역할, 키보드/터치 가능한 SVG 코트, 선수 1~6 시계 방향 이동, 전위·후위 표시.
- 퀴즈: 4지선다 10문항, 즉시 해설, 결과 및 오답 복습, 다시 풀기, 완료 기록만 로컬 저장.
- 관리자 보조 도구: URL·제목·날짜·장면 검사, JSON 항목 복사, 배열 형태의 JSON 다운로드.
- 데이터별 오류 표시 및 재시도. 다른 페이지로 오류가 전파되지 않도록 분리.

## 콘텐츠 편집

원본 PRD는 `PRD.md`에 보관했습니다. 정적 데이터 원본은 `public/data/`입니다. 빌드하면 배포 파일의 `dist/data/`로 복사됩니다.

| 파일           | 내용                                  |
| -------------- | ------------------------------------- |
| videos.json    | 실제 영상 목록. 초기값은 빈 배열 `[]` |
| terms.json     | 용어와 주제, 쉬운 예시                |
| rules.json     | 기본 규칙과 예시                      |
| skills.json    | 기술 단계, 실수, 연습, 연결 영상 ID   |
| positions.json | 전문 역할과 입문 팁                   |
| quizzes.json   | 질문, 선택지 4개, 정답 인덱스, 이유   |

실제 콘텐츠로 오해하지 않도록 PRD의 개발용 유튜브 ID는 공개 데이터에 넣지 않았습니다. 테스트에서만 예시 ID를 사용하며 실제 배구 영상을 검증한 것이 아닙니다.

### 영상 추가

1. 하단의 **관리자 JSON 도구**를 엽니다 (`#/editor`). 관리자 인증이 있는 페이지가 아니며 입력값은 서버로 전송되지 않습니다.
2. 확인된 유튜브 URL, 제목, 날짜, 카테고리와 태그를 입력합니다. 시작 시각은 정수 초입니다.
3. JSON 생성 후 항목을 복사하거나 `video-entry.json`을 다운로드합니다.
4. 기존 `public/data/videos.json` 배열에 항목을 **병합**합니다. 내보낸 파일로 기존 목록을 덮어쓰지 마세요. 각 `id`는 고유해야 합니다.
5. 기술별 참고 영상은 해당 `skills.json` 항목의 `videoIds`에 같은 영상 `id`를 추가합니다.
6. 빌드·검사 후 커밋하여 재배포합니다. 도구의 입력이나 다운로드만으로 공용 목록이 갱신되지는 않습니다.

지원 링크는 youtube.com/watch?v=, youtu.be/, youtube.com/shorts/, embed, live이며 정확한 호스트와 11자리 ID를 검사합니다. 실제 영상의 존재 여부·공유 동의·임베드 허용은 관리자가 별도로 확인해야 합니다. 제목·날짜·태그는 자동 수집하지 않습니다.

## GitHub Pages 배포

`.github/workflows/deploy.yml`에 main 브랜치 자동 배포 작업을 포함했습니다.

1. 원하는 GitHub 저장소에 이 프로젝트를 올립니다. 저장소: https://github.com/gmlduqzhd123-lab/Volleyball · Pages: https://gmlduqzhd123-lab.github.io/Volleyball/
2. 저장소 Settings → Pages → Source를 **GitHub Actions**로 설정합니다.
3. 기본 브랜치가 main이 아니면 workflow의 branches를 실제 브랜치에 맞춥니다.
4. main에 반영하거나 Actions의 Deploy GitHub Pages를 수동 실행합니다.
5. Actions 완료 후 표시되는 Pages URL을 확인합니다.

Vite의 `base: './'`와 해시 경로(`#/positions` 등)를 사용하여 저장소 이름을 고정하지 않고 프로젝트 하위 경로를 지원합니다. 새로고침도 index.html을 요청하므로 별도 서버 라우팅이 필요 없습니다. `dist/` 내용이 배포 대상입니다.

## 데이터와 외부 연결

백엔드/API 키가 없습니다. 비민감 퀴즈 완료 결과만 `volleyball-quiz-result` 키에 저장합니다. 저장소 차단 시에도 퀴즈는 작동합니다. Google Fonts 로딩 실패 시 시스템 글꼴을 사용합니다. 유튜브 썸네일과 플레이어는 인터넷 연결이 필요합니다. 플레이어 자동재생은 하지 않습니다.

기본 규칙은 FIVB 실내 6인제 기준입니다. 학교·동호회·9인제와 대회별 변형을 대신하지 않습니다. 공식 자료와 검증 기록은 `SOURCES.md`, `VERIFICATION.md`를 참고하세요. 코트는 학습용 개념도이며 실제 포메이션, 리베로 교대, 모든 반칙 사례를 시뮬레이션하지 않습니다.

