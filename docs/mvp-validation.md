# MVP v1 검증 기록

- BE `roomContractTest`: 81개 통과, 실패 0, 오류 0. 실제 DB를 띄우는 기본 contextLoads 테스트는 실행하지 않았습니다.
- FE `npm test -- --maxWorkers=1`: 14개 통과.
- FE `npm run build`: TypeScript/Vite 성공. 기존 단일 번들 크기 경고(약 860KB)는 남아 있습니다.
- 브라우저: 48개 검증 통과. 1440px HOST / 390px MEMBER / 360px PRESENTER. 한국어 폰트로 스크린샷을 확인하고 회의 도구 버튼 대비와 모바일 줄바꿈을 수정했습니다.
- WebRTC: Chromium 두 컨텍스트에서 실제 RTCPeerConnection, 가상 오디오 트랙, OFFER/ANSWER/ICE 교환과 connected 상태, 음소거/종료를 확인했습니다. 샌드박스 루프백 네트워크 테스트 옵션을 사용하며 사용자 런타임에는 적용하지 않습니다.
- 브라우저 REST/STOMP는 모킹입니다. 따라서 Spring과 PostgreSQL을 연결한 종단 테스트, 실제 마이크/스피커 음질, 3~4인/서로 다른 네트워크/TURN 연결을 검증한 결과가 아닙니다.
- 사용자 로컬 DB에는 접속하지 않았고 SQL을 실행하지 않았습니다. FE `기록/erd_patch_v1/`의 수동 적용 후 로컬 통합 검증이 필요합니다.

## 확인한 중요 경계

회의록/할 일의 낙관적 버전 검사, 한 표 유지와 투표 마감, 방 밖 데이터/수신자 접근 거부, MEMBER 관리 권한 제한, HOST 보호, 만료·소진·폐기 초대 거부, 초대 원문 미저장, 내보내기 후 재입장·기존 WS 수신 차단, JWT 만료·종료된 방의 WS 전달 차단, 메시지 속도 제한, 워크스페이스 오너 위임 권한 오류 수정, 서버 기준 북마크 시간.

## 재현

- Java 21에서 `./gradlew roomContractTest`.
- FE에서 `npm test -- --maxWorkers=1` 및 `npm run build`.
- FE에서 `node tests/browser-check.mjs`. 필요하면 `PLAYWRIGHT_MODULE`, `CHROMIUM_PATH`, `TEST_KOREAN_FONT`로 로컬 실행 환경 경로를 지정합니다. API는 이 테스트 안에서 모킹되며 실제 로컬 DB나 외부 서버를 변경하지 않습니다.
- FE `tests/evidence/board-browser-results.json`에 브라우저 체크 목록을 보관합니다.

## 수동 확인 순서

DB 패치 적용 → 백엔드 시작 → 두 계정 로그인 → 초대 발급/입장 → 회의록 동시 수정 → 할 일 담당자/기한/상태 → 투표 생성/투표 변경/마감 → 음성 2인/3인/4인 → 호스트 음소거 요청/발표자 지정 → 잠금/내보내기 → 회의 종료. 다른 Wi-Fi/모바일 데이터에서는 승인된 STUN/TURN 설정 후 별도 테스트합니다.
