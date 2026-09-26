# 회의 기능 추가 v1

## 적용 전

**최신 BE 시작 전에 `erd_patch_v1/01_apply.sql`과 `02_verify.sql`을 사용자 로컬 PostgreSQL에서 실행합니다.** DB 백업/실행/검증 순서는 [패치 안내](./erd_patch_v1/README.md)에 있습니다. 실제 사용자 DB에 접근하거나 적용하지 않았습니다. 자동 마이그레이션 실행 기능은 추가하지 않았습니다.

FE/BE main을 각각 pull한 뒤 패치를 적용하고 BE → FE 순서로 재시작합니다. 프론트에 변경된 패키지 의존성은 없습니다.

## 사용 방법

- 회의실 상단 **회의 도구**: 공유 회의록, 할 일, 투표, 북마크, 대화 검색.
- 회의록은 모든 참가자가 편집합니다. 원격 변경 중 내 초안은 유지하고 저장 시 버전 불일치는 409로 알립니다. 최신 내용으로 교체하기 전에 초안을 복사하세요. Markdown 내보내기는 현재 초안과 저장된 할 일/북마크를 포함합니다.
- 할 일은 HOST/PRESENTER가 생성·수정·삭제합니다. 담당자는 현재 방 멤버만 선택하고 상태는 TODO/DOING/DONE입니다. 수정/삭제 모두 revision을 확인합니다.
- 투표는 HOST/PRESENTER가 만들고 마감합니다. 모든 참가자가 투표할 수 있고 마감 전에는 선택을 바꿀 수 있습니다. 서버에 계정별 한 표를 저장하며 결과에는 투표자 이름을 노출하지 않습니다. DB 관리자에게까지 익명인 시스템은 아닙니다.
- 북마크는 서버에서 회의실 생성 시점 기준의 경과 시간을 계산합니다. MEMBER는 본인의 북마크만 삭제하고 HOST/PRESENTER는 전체를 정리합니다. 기존 at_ms 정수 컬럼의 최대 약 24.8일 이후 값은 상한으로 제한합니다.
- 대화 검색은 서버의 저장 기록 전체에서 대소문자를 구분하지 않는 부분 일치 검색을 수행합니다. 최신 50개부터 이전 결과를 불러옵니다.
- **손들기** 상태는 참가자 목록에 표시합니다. 멤버 상태와 회의 도구는 3초마다 조회하며 쓰기 후 즉시 새로고침합니다. 실시간 공동 문서 CRDT는 아닙니다.
- **호스트 관리**: 새 참가자 입장 잠금, 발표자 지정/해제, 음소거 요청/해제, 내보내기, 회의 종료, 만료 시간·사용 횟수 제한 초대 발급/폐기.
- 잠금은 이미 가입한 멤버의 복귀는 허용하고 신규 멤버의 일반/초대 입장을 막습니다. 내보내기는 멤버십을 삭제하고 `room_bans`로 재입장을 차단합니다. 이 버전에는 차단 해제 UI가 없습니다.
- 제한 초대 원문은 발급 직후 한 번 표시합니다. 서버에는 SHA-256 해시만 저장합니다. 재발급 또는 폐기 후 새 링크를 전달하세요. 로그인 후 원래 초대 화면으로 돌아옵니다. 외부로 초대 메시지를 자동 발송하지 않습니다.
- 회의 종료 후 쓰기/음성/WS 전달을 차단합니다. 현재 회의실 화면은 종료 안내로 바뀝니다. 기록은 DB에 보존되고 기존 멤버용 GET 기록 API는 계속 조회할 수 있습니다. 종료된 회의 기록 목록 UI는 후속 항목입니다.
- 보드 우측 상단 다운로드 버튼으로 PNG를 저장합니다. 1280×850 보드와 스티키를 그리는 내보내기이며 긴 노트는 이미지에서 일부만 보일 수 있습니다. 원문은 서버에 보존됩니다.

## WebRTC 음성

음성 참여 버튼 → 마이크 허용 → 최대 4명 P2P Mesh. 실제 오디오 트랙을 전달하며 참여자 연결 상태/마이크 on-off/나가기/페이지 종료 시 트랙 정리를 구현했습니다. 같은 계정은 한 탭에서만 음성에 참여하세요. 연결이 끊기면 음성을 종료하며 STOMP 재연결 후 다시 참여합니다.

`VITE_RTC_ICE_SERVERS`는 RTCIceServer 배열 JSON입니다. 기본 `[]`로 같은 네트워크에서 시험할 수 있습니다. 다른 네트워크에서는 사용자가 운영하는 STUN/TURN을 설정하고 재시작해야 합니다. TURN 계정이나 외부 서비스는 생성/변경하지 않았습니다. 프론트 환경 변수는 브라우저에 공개되므로 운영에서는 장기 TURN 비밀번호 대신 단기 발급을 사용하세요. HTTPS 또는 localhost가 필요합니다.

호스트 음소거는 공식 클라이언트가 오디오 트랙을 비활성화하는 방식입니다. P2P라서 악성 클라이언트까지 서버가 미디어를 강제 차단하지는 못합니다. 서버는 SDP/ICE를 지정된 방 멤버에게만 전달하며 타인의 개인 시그널 구독을 거부합니다. 음성 녹음·저장은 하지 않습니다.

## REST 연결점

기준 `/room/{roomId}`이며 프론트 개발 프록시는 `/api`를 붙입니다. 모든 요청은 Bearer JWT와 현재 방 멤버십을 검사합니다.

| 메서드·경로 | 동작·권한 |
|---|---|
| GET `/meeting` | 회의록/할 일/투표/북마크, MEMBER 이상 |
| PUT `/meeting/note` | `{content,version}`, MEMBER 이상 |
| POST `/meeting/tasks` | `{title,description,assigneeId,dueDate,status,revision:0}`, HOST/PRESENTER |
| PUT `/meeting/tasks/{id}` | 같은 본문 + 현재 revision, HOST/PRESENTER |
| DELETE `/meeting/tasks/{id}?revision=` | HOST/PRESENTER |
| POST `/meeting/polls` | `{question,options:[string]}`, HOST/PRESENTER |
| PUT `/meeting/polls/{id}/vote` | `{optionId}`, MEMBER 이상 |
| POST `/meeting/polls/{id}/close` | HOST/PRESENTER |
| POST `/meeting/bookmarks` | `{label}`, MEMBER 이상; atMs는 서버 계산 |
| DELETE `/meeting/bookmarks/{id}` | 작성자/HOST/PRESENTER |
| GET `/messages/search?q=&before=` | MEMBER 이상; `{items,nextCursor,hasMore}` |
| GET `/controls` | `{locked,ended}`, MEMBER 이상 |
| PUT `/controls/hand` | `{value:boolean}`, 본인 |
| PUT `/controls/lock` | `{value:boolean}`, HOST |
| POST `/controls/end` | HOST |
| PUT `/controls/members/{userId}/role` | `{role:MEMBER\|PRESENTER}`, HOST |
| PUT `/controls/members/{userId}/mute` | `{value:boolean}`, HOST |
| DELETE `/controls/members/{userId}` | HOST, 호스트 본인 제외 |
| GET/POST `/controls/invites` | HOST; 발급 `{hours:1..168,maxUses:1..100}` |
| DELETE `/controls/invites/{id}` | HOST, 폐기 |
| POST `/controls/redeem` | `{token}`, 로그인 사용자, 멤버십 없는 초대 대상도 허용 |

## STOMP 연결점

- 기존 SockJS `/ws-stomp`, CONNECT Authorization Bearer 유지.
- SEND `/pub/signal/room/{roomId}`: `{type,target?,data?}`.
- SUB `/sub/signal/room/{roomId}`: JOIN/LEAVE만. data/target은 비어 있어야 합니다.
- SUB `/sub/signal/room/{roomId}/user/{내 userId}`: HELLO/OFFER/ANSWER/ICE.
- sender는 클라이언트 입력을 신뢰하지 않고 인증 정보에서 결정합니다.
- 기존 구독에도 outbound에서 JWT 만료/멤버십/방 종료를 확인해 내보낸 멤버의 후속 전달을 막습니다.
- 세션별 1초 구간에서 채팅 8회, 커서 20회, 시그널 80회 제한. 최대 SEND payload 32KiB. 제한을 넘으면 STOMP 연결이 거부될 수 있으며 UI 재시도가 필요합니다. 분산 Redis rate limit은 아닙니다.
- HOST 제어는 기존 room_events에 기록합니다. LOCK/END는 REACTION 타입의 action payload로 저장합니다. 별도 audit_logs 조회 화면은 아직 없습니다.

## 검증과 남은 범위

실행 결과는 `docs/mvp-validation.md`와 `tests/evidence/board-browser-results.json`을 참고합니다. 브라우저의 REST/STOMP는 모킹이며 WebRTC는 실제 브라우저 RTCPeerConnection + 가상 마이크를 사용했습니다. 실제 PostgreSQL 적용, 실제 마이크 음질, 서로 다른 네트워크의 STUN/TURN, 운영 배포는 사용자 환경에서 확인해야 합니다.

기존 로드맵 P3/P4 전체 완료를 의미하지 않습니다. 자유 펜·도형, CRDT/페이지·리플레이, 채팅 스레드/파일 업로드, 이메일·비밀번호 입장, 관리자 UI, Redis/SFU/TURN 운영 구축은 아직 미구현입니다. 외부 스토리지·메일·미디어 서버 설정이나 공개 배포를 자동으로 변경하지 않았습니다.
