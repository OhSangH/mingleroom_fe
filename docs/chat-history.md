# 채팅 저장 및 이전 기록 조회

기존 `/pub/chat/room/{roomId}` 전송과 `/sub/chat/room/{roomId}` 구독 경로를 유지하면서 TEXT 메시지를 `chat_messages` 테이블에 저장합니다. 서비스 트랜잭션이 커밋된 후에만 STOMP 응답을 반환합니다. 방 ID와 사용자/표시 이름은 서버가 결정합니다. 메시지 생성 시간은 서버 UTC이며 화면에서는 사용자의 로컬 시간으로 표시합니다. 테이블 추가나 자동 DDL 변경은 없습니다.

## 계약

전송: `{roomId,message,type:"TEXT",clientMessageId}`. `clientMessageId`는 선택 필드로 영문/숫자/하이픈 1~64자이며 현재 프론트는 UUID를 생성합니다. 기존 클라이언트의 sender와 roomId 값으로 발신자를 바꾸거나 다른 방에 저장할 수 없습니다.

수신: `{id,roomId,sender,message,type,eventType:null,senderId,createdAt,clientMessageId}`. `id`와 `senderId`는 BIGINT 정밀도 유지를 위해 문자열입니다. 작성자 이름은 조회 시 현재 사용자 표시 이름을 사용합니다.

GET `/room/{roomId}/messages?limit=50`
- 최근 대화: before/after 없이 호출. 응답 items는 오래된 순서입니다.
- 이전 대화: `before={nextCursor}`. 한 페이지를 더 조회할 수 있으면 hasMore=true와 nextCursor를 반환합니다.
- 재접속 보충: `after={마지막 메시지 ID}`. hasMore이면 nextCursor를 다음 after로 사용합니다.
- before와 after는 동시에 사용할 수 없습니다. limit은 1~100, 기본 50입니다.
- 응답: `{items,nextCursor,hasMore}`. 삭제된 메시지는 제외하며 현재 방 멤버만 조회할 수 있습니다.

전송은 방 행 잠금으로 같은 방의 메시지 ID 할당/커밋을 직렬화합니다. 현재 보드 저장과 같은 방 잠금을 사용합니다. 닫힌 방에 새 메시지를 보내는 것은 거부하지만 등록 멤버의 지난 기록 조회는 허용합니다.

## 화면 동작

입장 시 최근 50개, '이전 대화 불러오기'로 과거 기록을 추가합니다. 재접속과 탭 복귀 시 누락분을 페이지 단위로 보충하고 최근 구간도 다시 확인합니다. 실시간 이벤트와 기록을 DB 메시지 ID로 합쳐 중복 표시를 막습니다. 이전 기록을 읽고 있는 동안 새 메시지가 와도 화면을 강제로 맨 아래로 이동하지 않습니다.

전송은 서버가 보낸 저장 확인 이벤트를 받은 뒤 입력란을 비웁니다. 확인을 기다리는 동안 추가 전송을 막고, 12초 내 응답을 받지 못하면 입력을 유지하며 기록을 재조회합니다. 확인 실패는 저장 실패를 뜻하지 않을 수 있으므로 자동 재전송하지 않습니다. clientMessageId는 확인용이며 DB에 저장되는 멱등 키가 아닙니다. 사용자가 같은 내용을 다시 보내면 별도 메시지로 저장될 수 있습니다.

## 적용과 검증

프론트·백엔드를 함께 업데이트하고 재시작합니다. 기존 개발 DB 설정과 Java 21을 사용합니다.

- 백엔드 `bash gradlew roomContractTest`: 38개 통과. DB 없는 Mockito 계약 검사입니다.
- 프론트 `npm test`: 14개 통과. `npm run build` 성공.
- `npx playwright install chromium` 후 `node tests/browser-check.mjs`: 1440/390/360px에서 27개 검사 통과.
- 브라우저는 모의 REST/SockJS-STOMP로 검사했습니다. 누락 70개 복구, 중복 수신 제거, 새로고침 복원, 모바일 송수신, 확인 응답 유실 시 입력 유지와 기록 복구를 포함합니다.
- 실제 Spring 서버와 PostgreSQL의 종단 간 검증은 사용자 개발 환경에서 추가 확인해야 합니다. 브라우저 결과는 `tests/evidence/board-browser-results.json`에 있습니다.

실제 개발 환경 확인: 서로 다른 두 계정으로 같은 방 입장 → 메시지 교환 → 새로고침/재입장 후 기록 확인 → 한 계정 연결이 끊긴 동안 메시지 전송 → 재연결해 누락 복구 확인.

첨부 파일 업로드, 메시지 수정/삭제 UI, 읽음 확인, 서버 간 브로커 동기화, WebRTC 음성은 후속 범위입니다. 현재 로컬 원점 허용과 기존 STOMP 구독 권한 정책을 유지하며 배포/공개 설정은 변경하지 않습니다.
