# 공유·QR·앱 설치 검증

검사일: 2026-10-12 (한국 시간). 공개 주소: https://gmlduqzhd123-lab.github.io/Volleyball/

## 구현

- 모든 공통 하단에 `© 2026 엽쌤. All rights reserved.`와 외부 콘텐츠 원저작자 안내.
- 하단 공유 패널의 QR와 복사·공유 URL은 공개 사이트 기본 주소로 통일.
- QR를 브라우저에서 생성하며 외부 QR 서비스로 주소를 전송하지 않음. 360px PNG 저장.
- Clipboard API 복사, 지원 환경의 Web Share API, 거부·취소·미지원 안내.
- 앱 이름, 배구공 아이콘 180/192/512px, 상대 시작 주소와 범위의 PWA manifest.
- 실제 `beforeinstallprompt`를 받은 경우만 설치 버튼 표시. 일회성 요청 소비, 취소 안내, `appinstalled` 및 standalone 상태 처리.
- 아이폰·아이패드 Safari, Android Chrome, PC Chrome·Edge 및 Mac Safari 설치 안내.
- 빌드별 서비스 워커: 앱 파일·학습 JSON 네트워크 우선, 저장된 파일의 오프라인 대체, 앱 범위 밖/외부 영상은 제외, 앱 이전 캐시만 정리.

## 로컬 검사

Windows 개발 PC, Playwright Chromium, Vite 개발 서버 및 실제 빌드의 `/volleyball/` 하위 경로 서버.

| 검사 | 결과 및 범위 |
| --- | --- |
| 기존 단위 테스트 | 27개 통과 |
| 브라우저 테스트 | 기존 12개 + 신규 5개, 총 17개 통과 |
| 하단 안내 | 주요 메뉴·기술 상세·없는 영상·404 등 11개 경로 확인 |
| QR | 실제 PNG를 jsQR로 해독해 공개 URL 일치 확인 |
| 다운로드 | 다운로드 이벤트와 저장된 PNG 360×360 확인 |
| 링크 복사 | 실제 Chromium Clipboard API 쓰기/읽기 값 일치 |
| 공유 | 모의 API로 제목·문구·URL 전달, 취소와 실패 경로 확인. 실제 수신자에게 전송하지 않음 |
| 설치 상태 | 모의 이벤트로 버튼 표시·기본 이벤트 취소·일회성 프롬프트·취소·완료 상태 확인 |
| PWA 파일 | 실제 manifest 시작 주소, PNG 아이콘 크기, 실제 서비스 워커 `/volleyball/` 범위 확인 |
| 오프라인 | 실제 브라우저 네트워크를 차단하고 새로고침 후 홈·6개 기술·QR 표시 확인 |
| 반응형 | 360/390/768px에서 가로 넘침 없음, 공유 버튼 표시. 390px 화면 이미지 별도 저장 |

실물 스마트폰의 카메라 스캔, iOS 홈 화면 설치, Android 설치 완료 및 OS별 공유 대상 전송은 위 자동 검사에 포함되지 않습니다. QR 해독과 URL 접속을 구분하고 모든 기기에서 설치된다고 일반화하지 않습니다. 설치 지원과 메뉴는 브라우저 버전에 따라 달라질 수 있습니다.

## 공개 배포 검사

기능 커밋: `b17eca3f04703b913670899f2d8e81c04e938737`. [Pages 실행 38247758008](https://github.com/gmlduqzhd123-lab/Volleyball/actions/runs/38247758008)의 빌드·배포 성공을 확인했습니다. 원격 Git tree와 검사한 로컬 tree가 동일합니다.

2026-10-12 21:16 KST, Windows의 Playwright Chromium 156.0.8078.4에서 공개 HTTPS 사이트를 검사했습니다. 재실행: `node tests/verify-public-sharing.mjs`. 원시 결과: [sharing-public-checks.json](sharing-public-checks.json).

- 공개 페이지에서 다운로드한 QR PNG를 해독: 기본 공개 URL과 일치, 360×360 PNG.
- 링크 복사 후 실제 Clipboard API 읽기: URL과 일치.
- QR에 연결된 링크를 클릭: 공개 기본 주소에 접속하고 홈 제목 표시.
- manifest 앱 이름·시작 주소·범위 및 PNG 아이콘 192/512px 확인.
- 서비스 워커 활성화와 `/Volleyball/` 범위 확인. 네트워크 차단 후 새로고침한 홈과 기술 카드 6개 표시.
- 배포 HTML·메인 JS·CSS·manifest·서비스 워커·PNG 아이콘의 SHA-256이 로컬 빌드와 일치.
- 390px 공개 화면에서 가로 넘침 없음. 실제 공개 화면은 로컬 `artifacts/sharing-live-mobile.png`에 저장.
- 일반 Windows Chrome에서도 공개 공유 패널, 외부 저작권 안내, 공유 기능 버튼, 링크 복사 성공 메시지를 확인. 로컬 빌드에서는 실제 설치 가능 이벤트에 따라 ‘앱 설치’ 버튼이 표시되는 것을 확인.

실제 OS 공유 창에서 대상 선택·전송과 PWA 설치 완료·설치된 앱 실행은 검증하지 않았습니다. 해당 흐름의 API 전달·취소·완료 상태는 모의 이벤트 검사 결과입니다. 스마트폰 카메라 스캔도 미검증이며, 여기서는 PNG 해독과 연결된 공개 주소 접속을 확인했습니다. 브라우저 자동 검사를 실물 기기 결과로 간주하지 않습니다.

## 참고 문서

- [MDN: PWA 설치 가능 조건](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [MDN: 앱에서 설치 요청](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt)
- [node-qrcode 공식 저장소](https://github.com/soldair/node-qrcode)
