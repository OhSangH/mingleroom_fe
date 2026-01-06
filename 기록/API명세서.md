````md
# API 명세서 (재정리) — 회의/브레인스토밍 서비스

Spring Boot 3 + React(TypeScript)

> 규칙

- **Auth 관련 REST는 `/auth/**`\*\*
- 그 외는 도메인 기준으로 **`/room/**`, `/user/**`, `/file/**`, `/report/**`, `/admin/**`\*\*
- 인증: `Authorization: Bearer <JWT>`
- 날짜/시간: ISO-8601 (`2026-01-06T20:45:00+09:00`)

---

## 0. 공통 규약

### 0.1 공통 응답 포맷(권장)

- 성공

```json
{ "success": true, "data": {} }
```
````

- 실패

```json
{
  "success": false,
  "error": {
    "code": "ROOM_403",
    "message": "권한이 없습니다.",
    "details": {}
  }
}
```

### 0.2 공통 페이징(권장)

- page 기반

  - Query: `?page=0&size=20&sort=createdAt,desc`

- 또는 cursor 기반(채팅 로그 등)

  - Query: `?cursor=100&size=50`

---

## 1. Auth (인증) — prefix: `/auth/**`

### 1.1 회원가입

| Method | Endpoint       | Auth | 설명     |
| ------ | -------------- | ---- | -------- |
| POST   | `/auth/signup` | X    | 회원가입 |

**Request**

```json
{ "email": "user@test.com", "password": "P@ssw0rd!", "username": "ohsang" }
```

**Response 201**

```json
{ "success": true, "data": { "userId": 1, "email": "user@test.com", "username": "ohsang" } }
```

### 1.2 로그인

| Method | Endpoint      | Auth | 설명             |
| ------ | ------------- | ---- | ---------------- |
| POST   | `/auth/login` | X    | 로그인(JWT 발급) |

**Request**

```json
{ "email": "user@test.com", "password": "P@ssw0rd!" }
```

**Response 200**

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "user": { "userId": 1, "email": "user@test.com", "username": "ohsang" }
  }
}
```

### 1.3 내 정보

| Method | Endpoint   | Auth | 설명             |
| ------ | ---------- | ---- | ---------------- |
| GET    | `/auth/me` | O    | 현재 로그인 유저 |

---

## 2. User (유저) — prefix: `/user/**`

### 2.1 내 프로필 조회/수정

| Method | Endpoint   | Auth | 설명           |
| ------ | ---------- | ---- | -------------- |
| GET    | `/user/me` | O    | 내 프로필      |
| PATCH  | `/user/me` | O    | 내 프로필 수정 |

**PATCH Request**

```json
{ "username": "newName", "profileImageUrl": "https://..." }
```

### 2.2 유저 프로필 조회(선택)

| Method | Endpoint         | Auth | 설명                      |
| ------ | ---------------- | ---- | ------------------------- |
| GET    | `/user/{userId}` | O    | 유저 프로필(공개 범위 내) |

---

## 3. Room (룸) — prefix: `/room/**`

### 3.1 룸 생성

| Method | Endpoint | Auth | 설명                   |
| ------ | -------- | ---- | ---------------------- |
| POST   | `/room`  | O    | 룸 생성(생성자는 HOST) |

**Request**

```json
{
  "title": "기획 회의",
  "visibility": "PUBLIC|PRIVATE",
  "password": "1234"
}
```

**Response 201**

```json
{
  "success": true,
  "data": {
    "roomId": 3,
    "title": "기획 회의",
    "visibility": "PRIVATE",
    "hostUserId": 1,
    "createdAt": "2026-01-06T20:30:00+09:00"
  }
}
```

### 3.2 룸 목록/검색

| Method | Endpoint | Auth | 설명                 |
| ------ | -------- | ---- | -------------------- |
| GET    | `/room`  | O    | 룸 목록(검색/페이징) |

**Query 예시**

- `?keyword=기획&visibility=PUBLIC&page=0&size=20`

### 3.3 룸 상세/수정/삭제

| Method | Endpoint         | Auth    | 설명              |
| ------ | ---------------- | ------- | ----------------- |
| GET    | `/room/{roomId}` | O       | 룸 상세 + 내 role |
| PATCH  | `/room/{roomId}` | O(HOST) | 룸 설정 변경      |
| DELETE | `/room/{roomId}` | O(HOST) | 룸 삭제           |

**PATCH Request(예시)**

```json
{ "title": "기획 회의(수정)", "visibility": "PRIVATE" }
```

### 3.4 룸 잠금(비밀번호) (선택)

| Method | Endpoint              | Auth    | 설명               |
| ------ | --------------------- | ------- | ------------------ |
| POST   | `/room/{roomId}/lock` | O(HOST) | 잠금/비밀번호 설정 |
| DELETE | `/room/{roomId}/lock` | O(HOST) | 잠금 해제          |

---

## 4. Room Member (룸 멤버) — prefix: `/room/**`

### 4.1 룸 입장/퇴장

| Method | Endpoint               | Auth | 설명                      |
| ------ | ---------------------- | ---- | ------------------------- |
| POST   | `/room/{roomId}/join`  | O    | 룸 입장(멤버십 생성/갱신) |
| POST   | `/room/{roomId}/leave` | O    | 룸 퇴장                   |

**JOIN Request(잠금/초대 적용 시)**

```json
{ "password": "1234", "inviteToken": "inv-abc" }
```

### 4.2 멤버 목록

| Method | Endpoint                 | Auth | 설명      |
| ------ | ------------------------ | ---- | --------- |
| GET    | `/room/{roomId}/members` | O    | 멤버 목록 |

**Response(예시)**

```json
{
  "success": true,
  "data": [
    { "userId": 1, "username": "ohsang", "roleInRoom": "HOST", "joinedAt": "2026-01-06T20:31:00+09:00" },
    { "userId": 2, "username": "kim", "roleInRoom": "MEMBER", "joinedAt": "2026-01-06T20:32:00+09:00" }
  ]
}
```

### 4.3 권한/상태 제어(호스트 기능)

| Method | Endpoint                               | Auth              | 설명                             |
| ------ | -------------------------------------- | ----------------- | -------------------------------- |
| PATCH  | `/room/{roomId}/members/{userId}/role` | O(HOST)           | 역할 변경(HOST/PRESENTER/MEMBER) |
| POST   | `/room/{roomId}/members/{userId}/kick` | O(HOST)           | 강퇴                             |
| POST   | `/room/{roomId}/members/{userId}/mute` | O(HOST/PRESENTER) | 음소거 강제                      |
| DELETE | `/room/{roomId}/members/{userId}/mute` | O(HOST/PRESENTER) | 음소거 해제                      |

---

## 5. Invite (초대) — prefix: `/room/**`

### 5.1 초대 링크 생성/검증

| Method | Endpoint                     | Auth    | 설명           |
| ------ | ---------------------------- | ------- | -------------- |
| POST   | `/room/{roomId}/invite`      | O(HOST) | 초대 토큰 생성 |
| GET    | `/room/invite/{inviteToken}` | O       | 초대 토큰 검증 |

**Invite 생성 Request**

```json
{ "expiresInMinutes": 60, "oneTime": true }
```

**Invite 생성 Response**

```json
{
  "success": true,
  "data": {
    "inviteToken": "inv-abc",
    "expiresAt": "2026-01-06T22:00:00+09:00"
  }
}
```

---

## 6. Chat (채팅) — REST는 조회/검색/고정용, 실시간은 WS

### 6.1 채팅 로그 조회

| Method | Endpoint                     | Auth | 설명                   |
| ------ | ---------------------------- | ---- | ---------------------- |
| GET    | `/room/{roomId}/chat`        | O    | 채팅 로그 조회(페이징) |
| GET    | `/room/{roomId}/chat/search` | O    | 채팅 검색              |

**MessageType (현재 enum 기준)**

- `TEXT`, `FILE`, `IMAGE`, `BOARD_SNAPSHOT`

**ChatMessage(예시)**

```json
{
  "messageId": 100,
  "roomId": 3,
  "sender": { "userId": 1, "username": "ohsang" },
  "type": "TEXT",
  "content": "회의 시작합니다",
  "createdAt": "2026-01-06T20:40:00+09:00",
  "pinned": false
}
```

### 6.2 고정 메시지(선택)

| Method | Endpoint                              | Auth    | 설명      |
| ------ | ------------------------------------- | ------- | --------- |
| POST   | `/room/{roomId}/chat/{messageId}/pin` | O(HOST) | 고정      |
| DELETE | `/room/{roomId}/chat/{messageId}/pin` | O(HOST) | 고정 해제 |

---

## 7. File (파일) — prefix: `/file/**` (선택)

### 7.1 Presigned 업로드(권장)

| Method | Endpoint         | Auth | 설명                        |
| ------ | ---------------- | ---- | --------------------------- |
| POST   | `/file/presign`  | O    | presigned URL 발급          |
| POST   | `/file/complete` | O    | 업로드 완료 처리(메타 저장) |
| GET    | `/file/{fileId}` | O    | 파일 메타 조회              |

---

## 8. Board (화이트보드) — REST는 스냅샷/히스토리, 실시간은 WS

### 8.1 페이지/스냅샷/히스토리

| Method | Endpoint                        | Auth | 설명          |
| ------ | ------------------------------- | ---- | ------------- |
| GET    | `/room/{roomId}/board/pages`    | O    | 페이지 목록   |
| POST   | `/room/{roomId}/board/pages`    | O    | 페이지 생성   |
| GET    | `/room/{roomId}/board/snapshot` | O    | 최신 스냅샷   |
| POST   | `/room/{roomId}/board/snapshot` | O    | 스냅샷 저장   |
| GET    | `/room/{roomId}/board/history`  | O    | 버전 히스토리 |

**Board Snapshot 예시**

```json
{
  "roomId": 3,
  "pageNo": 1,
  "version": 12,
  "data": { "elements": [], "appState": {} },
  "createdAt": "2026-01-06T21:10:00+09:00"
}
```

---

## 9. Note / Action Item (회의록/할일) — prefix: `/room/**`

### 9.1 공유 노트

| Method | Endpoint              | Auth | 설명            |
| ------ | --------------------- | ---- | --------------- |
| GET    | `/room/{roomId}/note` | O    | 노트 조회       |
| PUT    | `/room/{roomId}/note` | O    | 노트 저장(전체) |

### 9.2 액션아이템

| Method | Endpoint                           | Auth | 설명 |
| ------ | ---------------------------------- | ---- | ---- |
| POST   | `/room/{roomId}/action`            | O    | 생성 |
| GET    | `/room/{roomId}/action`            | O    | 목록 |
| PATCH  | `/room/{roomId}/action/{actionId}` | O    | 수정 |
| DELETE | `/room/{roomId}/action/{actionId}` | O    | 삭제 |

---

## 10. Bookmark (타임스탬프) — prefix: `/room/**` (선택)

| Method | Endpoint                               | Auth | 설명        |
| ------ | -------------------------------------- | ---- | ----------- |
| POST   | `/room/{roomId}/bookmark`              | O    | 북마크 생성 |
| GET    | `/room/{roomId}/bookmark`              | O    | 목록        |
| DELETE | `/room/{roomId}/bookmark/{bookmarkId}` | O    | 삭제        |

---

## 11. Poll (투표/설문) — prefix: `/room/**` (선택)

| Method | Endpoint                              | Auth | 설명      |
| ------ | ------------------------------------- | ---- | --------- |
| POST   | `/room/{roomId}/poll`                 | O    | 투표 생성 |
| GET    | `/room/{roomId}/poll`                 | O    | 목록      |
| POST   | `/room/{roomId}/poll/{pollId}/vote`   | O    | 투표      |
| GET    | `/room/{roomId}/poll/{pollId}/result` | O    | 결과      |

---

## 12. Report (신고/피드백) — prefix: `/report/**` (선택)

| Method | Endpoint           | Auth | 설명                 |
| ------ | ------------------ | ---- | -------------------- |
| POST   | `/report`          | O    | 신고(유저/메시지/룸) |
| POST   | `/report/feedback` | O    | 피드백/버그리포트    |

---

## 13. Admin (관리자) — prefix: `/admin/**` (선택)

| Method | Endpoint         | Auth     | 설명      |
| ------ | ---------------- | -------- | --------- |
| GET    | `/admin/users`   | O(ADMIN) | 유저 목록 |
| GET    | `/admin/rooms`   | O(ADMIN) | 룸 목록   |
| GET    | `/admin/reports` | O(ADMIN) | 신고 목록 |
| GET    | `/admin/audit`   | O(ADMIN) | 감사 로그 |

---

# WebSocket(STOMP) 명세

## WS Endpoint

- 예: `/ws-stomp`

## 인증(권장)

- STOMP `CONNECT` Headers:

  - `Authorization: Bearer <JWT>`

## Destination 규칙

- Client → Server(SEND): `/app/**`
- Server → Client(SUBSCRIBE): `/topic/**`, 개인 큐는 `/user/queue/**`

## WS Destination 표

| 목적            | SEND                        | SUBSCRIBE                     |
| --------------- | --------------------------- | ----------------------------- |
| 채팅            | `/app/room/{roomId}/chat`   | `/topic/room/{roomId}/chat`   |
| 룸 이벤트       | `/app/room/{roomId}/event`  | `/topic/room/{roomId}/event`  |
| WebRTC 시그널링 | `/app/room/{roomId}/signal` | `/topic/room/{roomId}/signal` |
| 화이트보드      | `/app/room/{roomId}/board`  | `/topic/room/{roomId}/board`  |
| 개인 알림       | (서버 발행)                 | `/user/queue/notice`          |

## WS 공통 Envelope(권장)

```json
{
  "roomId": 3,
  "senderUserId": 1,
  "payload": {},
  "createdAt": "2026-01-06T20:45:00+09:00"
}
```

## WS: 채팅 메시지 payload

> MessageType enum을 그대로 사용

```json
{
  "type": "TEXT|FILE|IMAGE|BOARD_SNAPSHOT",
  "content": "안녕하세요",
  "replyToMessageId": 10,
  "mentions": [2, 3]
}
```

## WS: 룸 이벤트 payload (RoomEventType 예시)

> 실제 `RoomEventType` enum에 맞춰 확정하면 됨

```json
{
  "eventType": "JOIN|LEAVE|MUTE|KICK|ROLE_CHANGE|HAND_UP|REACTION",
  "targetUserId": 2,
  "data": { "emoji": "👏" }
}
```

## WS: WebRTC 시그널링 payload

```json
{
  "signalType": "PEER_JOIN|OFFER|ANSWER|ICE|PEER_LEAVE",
  "fromUserId": 1,
  "toUserId": 2,
  "data": {
    "sdp": "....",
    "candidate": { "candidate": "...", "sdpMid": "0", "sdpMLineIndex": 0 }
  }
}
```

## WS: 화이트보드 payload

```json
{
  "boardType": "DRAW|SHAPE|TEXT|CURSOR|SNAPSHOT|UNDO|REDO|PAGE_CHANGE",
  "pageNo": 1,
  "data": {}
}
```

---

# HTTP 상태코드 가이드(권장)

- 200 OK, 201 Created, 204 No Content
- 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 429 Too Many Requests, 500 Internal Server Error
