# 검증 기록

검증일: 2026-10-12 · Windows / Node.js 24.15.0

## 자동 검사

- TypeScript 검사 및 Vite 배포 빌드: 통과.
- Vitest 27개: 유튜브 URL·메타데이터·필터·학습 로직 및 실제 영상 카탈로그의 날짜·중복·출처·기술별 연결·로컬 재생 기록 검사.
- Playwright Chromium 12개 통과: 주요 메뉴, iframe 지연 로딩, 학습·퀴즈·JSON 도구·오류 복구, 영상 검색·필터·기술별 카드 수·업로드/경기 날짜 구분, 모바일·하위 경로 진입 검사.
- 모바일 360px: 주요 화면 가로 넘침 없음, 햄버거 메뉴 열기/이동/닫기.
- 배포 빌드 `/volleyball/` 하위 경로: 해시 직접 진입, 새로고침, 기술 JSON 로딩.
- npm audit: 알려진 취약점 0개 (설치 시점).

## 화면 확인

- `artifacts/home-desktop.png`: 1440px 데스크톱 홈.
- `artifacts/home-mobile.png`: 390px 모바일 홈.
- `artifacts/positions-mobile.png`: 390px 모바일 코트와 역할.

이미지를 열어 한글 조판, 잘림, 화면 구성과 주요 조작부를 확인했습니다.

## 실제 환경 확인 및 한계

- 실제 YouTube 영상 64편의 원본 정보·내용·로컬 임베드 재생 확인. [영상 목록](docs/VIDEO_CATALOG.md), [영상별 재생 검증](docs/VIDEO_VERIFICATION.md) 참조.
- GitHub Pages 영상 배포: Actions 38243201927 성공. 공개 사이트 64/64 본 영상 재생·시간 진행 확인. Chrome 154.0.8037.98에서 광고 제외 상태를 함께 기록했습니다. [상세 기록](docs/video-playback-live.json).
- 실물 Android/iOS, Safari/VoiceOver 등 보조 기술 전체 검사: 미실시.
- 완전 오프라인 재방문: 서비스워커 미구현. 네트워크 오류 안내와 재시도만 지원.

## 운영 전 확인

- [x] 공개 업로드 영상 64편 제목·날짜·태그·임베드 재생 검수. 동호회 자체 영상은 아직 미등록.
- [ ] 대회 적용 규칙과 안내 문구 최종 검토.
- [x] 저장소 연결, Pages 설정, 실제 배포 URL 확인. 영상 재생은 실제 자료 등록 후 확인.
- [ ] 실물 휴대폰 터치·폰트·재생·회전 화면 확인.
