# 회의실 디자인 및 공동 화이트보드

기존 MingleRoom 비공개 프로토타입의 녹색 테마, 왼쪽 메뉴, 점 배경 화이트보드, 파스텔 노트, 오른쪽 채팅 패널을 실제 로그인/회의실 화면에 적용했습니다. 모바일은 보드·채팅·참가자 탭으로 전환합니다.

## 실행 및 사용

프론트와 백엔드 변경을 함께 적용하고 개발 서버를 재시작하세요. 프론트는 `npm ci`, `npm run dev`; 백엔드는 Java 21에서 `bash gradlew bootRun`으로 실행합니다. 백엔드의 기존 개발 DB 설정을 유지합니다.

방 생성 → 입장 → 노트 추가 → 내용/색상 지정 → 보드에 저장. 노트는 끌어서 이동하고 편집 버튼 또는 더블클릭으로 수정합니다. 확대/축소, 화면에 맞추기, 커서 표시, 초대 링크, 호스트/발표자용 집중 보기 기능을 제공합니다.

HOST/PRESENTER는 모든 노트를 수정·삭제할 수 있고 MEMBER는 본인 노트만 수정·삭제할 수 있습니다. 권한과 작성자는 서버가 결정합니다. 다른 사람이 같은 노트를 먼저 수정하면 409로 거부하고 최신 내용을 표시합니다. 입력 중인 내용을 자동으로 덮어쓰지 않습니다.

## API와 동기화

- GET `/room/{roomId}/board`: `{schema:"mingleroom-sticky-v1",version,notes}`
- PUT `/room/{roomId}/board/notes/{id}`: `{revision,text,color,x,y}`. 신규 노트 revision=0, 기존 노트는 응답의 revision을 사용합니다.
- DELETE `/room/{roomId}/board/notes/{id}?revision={revision}`
- 구독 `/sub/board/room/{roomId}`: 커밋된 전체 상태 수신
- 커서 전송 `/pub/cursor/room/{roomId}`: `{x,y}`
- 커서 구독 `/sub/cursor/room/{roomId}`: `{userId,name,x,y}`

기존 `/api` 프록시와 인증된 STOMP 연결을 재사용합니다. REST 응답과 이벤트는 version 순서로 반영하며 4초 간격 재조회 및 재접속 시 재조회로 누락된 상태를 복구합니다. 커서는 120ms 간격으로 보내고 8초 동안 수신하지 않은 커서는 화면에서 제거합니다. 커서는 DB에 저장하지 않습니다.

보드는 기존 `whiteboard_docs`, `whiteboard_pages`, `whiteboard_snapshots`를 사용하며 첫 변경 시 문서/페이지를 생성합니다. 방의 첫 문서/첫 페이지를 사용하며 다른 schema의 스냅샷은 덮어쓰지 않고 오류를 반환합니다. 신규 테이블/자동 DDL 변경은 없습니다. 노트는 최대 300개, 텍스트는 2000자입니다.

## 검증과 범위

- 프론트 프로덕션 빌드, 기존 REST 계약 테스트 8개 통과.
- 백엔드 DB 없는 계약 테스트 총 28개 통과(노트 권한, 동시 수정, 작성자 보존, 커밋 후 전송, 낯선 스키마 보호 포함).
- 1440px/390px/360px 브라우저 검사 20개 통과. 모바일 터치 생성·삭제, 다중 사용자 노트 동기화, 드래그 좌표 저장, 커서 수신, 채팅, 참가자 전환, 새로고침 복원 포함.
- 브라우저 검사에는 모의 REST/SockJS-STOMP 서버를 사용했습니다. 실제 Spring/PostgreSQL 종단 간 검증은 사용자의 개발 환경에서 추가 확인해야 합니다.
- 실행: `npm test`, `npm run build`, `npx playwright install chromium`, `node tests/browser-check.mjs`.

마이크 테스트는 내 장치의 마이크 권한만 확인하며 통화/녹음/타인 전송 기능이 아닙니다. 모달 닫기와 방 나가기 시 트랙을 정리합니다. 음성 WebRTC, 투표, 역할 변경, 노트/액션 아이템 별도 기능은 후속 범위입니다. 채팅 기록 저장은 후속 구현인 `docs/chat-history.md`를 참고하세요.

운영 규모에서는 스냅샷 보존 정책(현재 저장마다 전체 스냅샷 추가), 메시지/커서 빈도 제한, 다중 서버 브로커, 만료/권한 회수 시 기존 구독의 즉시 차단을 추가해야 합니다. 현재 STOMP 권한은 CONNECT와 SEND/SUBSCRIBE 시 검증합니다. 이번 작업에서 Sites 배포나 접근 공개 설정은 변경하지 않았습니다.
