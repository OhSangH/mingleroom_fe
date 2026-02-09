# MingleRoom API 명세서

## 1. 개요

- **Base URL**: `/api/v1` (예정)
- **Auth**: `Authorization: Bearer <JWT>` 헤더 필수 (로그인/회원가입 제외)
- **Date Format**: ISO-8601 (`yyyy-MM-dd'T'HH:mm:ssXXX`)

---

## 2. 인증 (Auth) - `/auth`

### 2.1 회원가입

- **POST** `/auth/signup`
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "username": "홍길동"
  }
  ```
- **Response (201)**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "username": "홍길동"
  }
  ```

### 2.2 로그인

- **POST** `/auth/login`
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "dGhpcyBpcy...",
    "expiresIn": 3600
  }
  ```

### 2.3 토큰 재발급

- **POST** `/auth/refresh`
- **Request**:
  ```json
  {
    "refreshToken": "dGhpcyBpcy..."
  }
  ```
- **Response (200)**:
  ```json
  {
    "accessToken": "new_access_token...",
    "refreshToken": "new_refresh_token..."
  }
  ```

### 2.4 내 정보 조회

- **GET** `/auth/me`
- **Response (200)**:
  ```json
  {
    "id": 1,
    "email": "user@example.com",
    "username": "홍길동",
    "profileImg": "https://...",
    "roleGlobal": "USER"
  }
  ```

### 2.5 로그아웃

- **POST** `/auth/logout`
- **Response (200)**:
  ```json
  {
    "message": "로그아웃 되었습니다."
  }
  ```

---

## 3. 사용자 (User) - `/users`

### 3.1 프로필 수정

- **PATCH** `/users/me`
- **Request**:
  ```json
  {
    "username": "새이름",
    "profileImg": "https://new-image.url"
  }
  ```
- **Response (200)**: User 정보 반환

### 3.2 비밀번호 변경

- **PATCH** `/users/me/password`
- **Request**:
  ```json
  {
    "currentPassword": "oldPassword",
    "newPassword": "newPassword"
  }
  ```

---

## 4. 워크스페이스 (Workspace) - `/workspaces`

### 4.1 워크스페이스 생성

- **POST** `/workspaces`
- **Request**:
  ```json
  {
    "name": "개발팀 워크스페이스"
  }
  ```
- **Response (201)**:
  ```json
  {
    "id": 1,
    "name": "개발팀 워크스페이스",
    "ownerId": 1,
    "createdAt": "..."
  }
  ```

### 4.2 내 워크스페이스 목록 조회

- **GET** `/workspaces`
- **Response (200)**: List<Workspace>

### 4.3 워크스페이스 상세 조회

- **GET** `/workspaces/{workspaceId}`
- **Response (200)**: Workspace 상세 정보

### 4.4 워크스페이스 수정 (Owner Only)

- **PATCH** `/workspaces/{workspaceId}`
- **Request**:
  ```json
  {
    "name": "변경된 이름"
  }
  ```

### 4.5 워크스페이스 삭제 (Owner Only)

- **DELETE** `/workspaces/{workspaceId}`

### 4.6 워크스페이스 소유권 이전 (Owner Only)

- **PATCH** `/workspaces/{workspaceId}/transfer-ownership`
- **Request**:
  ```json
  {
    "newOwnerId": 2
  }
  ```

---

## 5. 워크스페이스 멤버 (Workspace Member) - `/workspaces/{workspaceId}/members`

### 5.1 멤버 초대/추가 (이메일)

- **POST** `/workspaces/{workspaceId}/members`
- **Request**:
  ```json
  {
    "email": "invitee@example.com",
    "role": "MEMBER" // ADMIN, MEMBER
  }
  ```

### 5.2 멤버 목록 조회

- **GET** `/workspaces/{workspaceId}/members`
- **Response (200)**: List<WorkspaceMember>

### 5.3 멤버 권한 변경 (Admin Only)

- **PATCH** `/workspaces/{workspaceId}/members/{userId}/role`
- **Request**:
  ```json
  {
    "role": "ADMIN"
  }
  ```

### 5.4 멤버 추방 (Admin Only)

- **DELETE** `/workspaces/{workspaceId}/members/{userId}`

---

## 6. 룸 (Room) - `/rooms`

### 6.1 룸 생성

- **POST** `/rooms`
- **Request**:
  ```json
  {
    "workspaceId": 1, // Optional (워크스페이스 내부 룸일 경우)
    "title": "주간 회의",
    "visibility": "PRIVATE", // PUBLIC, PRIVATE
    "password": "roomPassword", // optional
    "invitePolicy": "OPEN" // OPEN, INVITE_ONLY
  }
  ```
- **Response (201)**:
  ```json
  {
    "id": 10,
    "title": "주간 회의",
    "hostId": 1,
    "visibility": "PRIVATE",
    "locked": false
  }
  ```

### 6.2 룸 목록 조회

- **GET** `/rooms`
- **Query Params**: `workspaceId`, `page`, `size`, `keyword`
- **Response (200)**: Page<Room>

### 6.3 룸 상세 조회

- **GET** `/rooms/{roomId}`
- **Response (200)**: Room 상세 정보

### 6.4 룸 입장 (멤버십 생성)

- **POST** `/rooms/{roomId}/join`
- **Request**:
  ```json
  {
    "password": "roomPassword" // 비공개 방일 경우
  }
  ```
- **Response (200)**:
  ```json
  {
    "roleInRoom": "MEMBER",
    "joinedAt": "2024-01-01T10:00:00Z"
  }
  ```

### 6.5 룸 설정 변경 (Host Only)

- **PATCH** `/rooms/{roomId}`
- **Request**:
  ```json
  {
    "title": "변경된 제목",
    "visibility": "PUBLIC",
    "locked": true
  }
  ```

### 6.6 룸 삭제 (Host Only)

- **DELETE** `/rooms/{roomId}`

### 6.7 룸 초대 링크 생성

- **POST** `/rooms/{roomId}/invites`
- **Request**:
  ```json
  {
    "expiresAt": "2024-01-02T10:00:00Z", // optional
    "maxUses": 10 // optional
  }
  ```
- **Response (201)**:
  ```json
  {
    "token": "a1b2c3d4...",
    "inviteUrl": "https://mingleroom.com/invite/a1b2c3d4...",
    "expiresAt": "..."
  }
  ```

### 6.8 초대 토큰 조회 (입장 전 정보 확인)

- **GET** `/rooms/invites/{token}`
- **Response (200)**:
  ```json
  {
    "room": { "id": 1, "title": "주간 회의", ... },
    "inviter": { "id": 1, "username": "홍길동" },
    "valid": true
  }
  ```

### 6.9 초대 토큰으로 입장

- **POST** `/rooms/invites/{token}/join`
- **Response (200)**: `6.4 룸 입장`과 동일

  ```

  ```

---

## 7. 룸 멤버 (Room Member) - `/rooms/{roomId}/members`

### 7.1 멤버 목록 조회

- **GET** `/rooms/{roomId}/members`
- **Response (200)**: List<RoomMember>

### 7.2 멤버 권한 변경 (Host Only)

- **PATCH** `/rooms/{roomId}/members/{userId}/role`
- **Request**:
  ```json
  {
    "role": "PRESENTER" // HOST, PRESENTER, MEMBER
  }
  ```

### 7.3 멤버 강퇴 (Host Only)

- **DELETE** `/rooms/{roomId}/members/{userId}`

---

## 8. 채팅 (Chat) - `/rooms/{roomId}/chats`

### 8.1 채팅 내역 조회

- **GET** `/rooms/{roomId}/chats`
- **Query Params**: `cursorId` (마지막 메시지 ID), `size`
- **Response (200)**:
  ```json
  [
    {
      "id": 100,
      "senderId": 1,
      "senderName": "홍길동",
      "type": "TEXT",
      "content": "안녕하세요",
      "createdAt": "..."
    }
  ]
  ```

---

## 9. 화이트보드 (Whiteboard) - `/rooms/{roomId}/whiteboard`

### 9.1 페이지 목록 조회

- **GET** `/rooms/{roomId}/whiteboard/pages`

### 9.2 스냅샷 저장

- **POST** `/rooms/{roomId}/whiteboard/pages/{pageId}/snapshot`
- **Request**:
  ```json
  {
    "version": 5,
    "dataBlob": { ... } // JSON 데이터
  }
  ```

### 9.3 최신 스냅샷 조회

- **GET** `/rooms/{roomId}/whiteboard/pages/{pageId}/snapshot`

---

## 10. 노트 (Note) - `/rooms/{roomId}/note`

### 10.1 노트 조회

- **GET** `/rooms/{roomId}/note`
- **Response (200)**:
  ```json
  {
    "content": "회의록 내용...",
    "version": 3,
    "updatedAt": "..."
  }
  ```

### 10.2 노트 저장 (전체 업데이트)

- **PUT** `/rooms/{roomId}/note`
- **Request**:
  ```json
  {
    "content": "수정된 회의록...",
    "version": 4
  }
  ```

---

## 11. 액션 아이템 (Action Item) - `/rooms/{roomId}/action-items`

### 11.1 액션 아이템 생성

- **POST** `/rooms/{roomId}/action-items`
- **Request**:
  ```json
  {
    "title": "API 명세서 작성",
    "assigneeId": 2,
    "dueDate": "2024-01-10"
  }
  ```

### 11.2 목록 조회

- **GET** `/rooms/{roomId}/action-items`
- **Query Params**: `status` (OPEN, DONE 등)

### 11.3 상태 변경

- **PATCH** `/rooms/{roomId}/action-items/{itemId}/status`
- **Request**:
  ```json
  {
    "status": "DONE"
  }
  ```

### 11.4 수정/삭제

- **PATCH** `/rooms/{roomId}/action-items/{itemId}`
- **DELETE** `/rooms/{roomId}/action-items/{itemId}`

---

## 12. 투표 (Poll) - `/rooms/{roomId}/polls`

### 12.1 투표 생성

- **POST** `/rooms/{roomId}/polls`
- **Request**:
  ```json
  {
    "question": "점심 메뉴는?",
    "anonymous": false,
    "options": [
      { "label": "짜장면", "sortOrder": 1 },
      { "label": "짬뽕", "sortOrder": 2 }
    ]
  }
  ```

### 12.2 투표 목록 조회

- **GET** `/rooms/{roomId}/polls`

### 12.3 투표 종료 (Host Only)

- **PATCH** `/rooms/{roomId}/polls/{pollId}/close`
- **Response (200)**:
  ```json
  {
    "id": 1,
    "closed": true,
    "closedAt": "..."
  }
  ```

### 12.4 투표하기

- **POST** `/rooms/{roomId}/polls/{pollId}/vote`
- **Request**:
  ```json
  {
    "optionId": 5
  }
  ```

### 12.5 투표 결과 조회

- **GET** `/rooms/{roomId}/polls/{pollId}/result`

---

## 13. 북마크 (Bookmark) - `/rooms/{roomId}/bookmarks`

### 13.1 북마크 생성

- **POST** `/rooms/{roomId}/bookmarks`
- **Request**:
  ```json
  {
    "label": "중요한 순간",
    "atMs": 120000 // 회의 시작 후 2분 지점
  }
  ```

### 13.2 북마크 목록 조회

- **GET** `/rooms/{roomId}/bookmarks`

### 13.3 북마크 삭제

- **DELETE** `/rooms/{roomId}/bookmarks/{bookmarkId}`

---

## 14. 파일 첨부 (Attachment) - `/attachments`

### 14.1 파일 업로드 (Presigned URL 요청 권장)

- **POST** `/attachments/presigned-url`
- **Request**:
  ```json
  {
    "fileName": "image.png",
    "fileSize": 10240,
    "mimeType": "image/png"
  }
  ```
- **Response (200)**:
  ```json
  {
    "uploadUrl": "https://s3.aws...",
    "publicUrl": "https://cdn...",
    "storageKey": "..."
  }
  ```

### 14.2 업로드 완료 처리 (메타데이터 저장)

- **POST** `/attachments`
- **Request**:
  ```json
  {
    "fileName": "image.png",
    "mimeType": "image/png",
    "fileSize": 10240,
    "storageProvider": "S3",
    "storageKey": "...",
    "publicUrl": "..."
  }
  ```

---

## 15. 신고 (Report) - `/reports`

### 15.1 신고하기

- **POST** `/reports`
- **Request**:
  ```json
  {
    "targetType": "USER", // USER, ROOM, CHAT
    "targetId": 123,
    "reason": "욕설 및 비방",
    "detail": "채팅에서 심한 욕설을 했습니다."
  }
  ```

---

## 16. 관리자 (Admin) - /admin

### 16.1 신고 목록 조회

- **GET** `/admin/reports`
- **Query Params**: `status` (OPEN, RESOLVED 등), `page`, `size`

### 16.2 신고 처리

- **PATCH** `/admin/reports/{reportId}`
- **Request**:
  ```json
  {
    "status": "RESOLVED", // RESOLVED, REJECTED
    "note": "처리 내용 메모..."
  }
  ```

---

## 17. 감사 로그 (Audit Log) - `/audit-logs` (Admin Only)

### 16.1 로그 조회

- **GET** `/audit-logs`
- **Query Params**: `workspaceId`, `roomId`, `actorId`, `page`, `size`

---

## 18. WebSocket (STOMP)

### 18.1 연결 및 인증

- **Endpoint**: `/ws-stomp`
- **Header**: `Authorization: Bearer <token>`

### 18.2 주요 토픽 (Subscribe)

- `/topic/room/{roomId}/chat`: 채팅 메시지 수신
- `/topic/room/{roomId}/event`: 입장/퇴장, 권한 변경 등 이벤트
- `/topic/room/{roomId}/board`: 화이트보드 드로잉 데이터
- `/topic/room/{roomId}/signal`: WebRTC 시그널링 (Offer/Answer/Candidate)

### 18.3 메시지 발행 (Send)

- `/app/chat`: 채팅 메시지 전송
- `/app/board`: 화이트보드 데이터 전송
- `/app/signal`: 시그널링 데이터 전송
