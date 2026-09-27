# 방 생성·설정 구현

## 구현 범위

- 대시보드의 새 회의실에서 PUBLIC/PRIVATE 공개 범위를 선택합니다. 기본값은 기존과 같은 PUBLIC입니다. 공개 방은 번호로 입장하고, 비공개 방은 제한 초대 링크로 신규 입장합니다.
- 회의실의 `호스트 관리 → 방 기본 설정`에서 이름과 공개 범위를 수정합니다. HOST만 서버 API를 사용할 수 있으며 PRESENTER/MEMBER/외부 계정은 거부합니다.
- 비공개→공개 변경은 사용자 확인 대화상자에서 승인해야 전송합니다. 서비스의 실제 방이나 Sites 공개 설정을 개발 도중 변경하지 않았습니다.
- 기존 멤버십/초대 링크/입장 잠금은 설정 변경으로 삭제하거나 해제하지 않습니다. 공개로 바꿔도 잠겨 있으면 신규 입장은 거부합니다.
- 설정을 읽었을 때의 이름·공개 범위를 expected 필드로 보냅니다. 방 행 잠금 후 현재 값이 다르면 409를 반환합니다. UI는 초안을 유지하고 `최신 설정 불러오기`로 복구합니다. 별도 revision 컬럼은 추가하지 않습니다.
- 변경은 기존 room_events의 REACTION 타입에 action=ROOM_SETTINGS와 변경 전후 값을 기록합니다.
- TEAM 방의 이름 변경은 허용하지만 일반/비공개 방과 TEAM 간 전환은 거부합니다. 워크스페이스 관계를 임의 변경하지 않습니다.
- 방 생성은 실제 지원되는 LINK 정책만 허용합니다. EMAIL/PASSWORD/MIXED는 400으로 명시적으로 거부합니다. TEAM 생성에는 workspaceId와 해당 워크스페이스 멤버십이 필요합니다. 팀 생성 UI/비밀번호·이메일 입장은 이번 범위에 포함하지 않습니다.

## API

기존 `POST /room/create`의 visibility를 PUBLIC 또는 PRIVATE로 지정합니다. invitePolicy=LINK, workspaceId=null을 사용하며 서버가 호스트 멤버십을 생성합니다. 이름 앞뒤 공백은 제거합니다.

신규 `PATCH /room/{roomId}`는 Bearer JWT가 필요합니다.

```json
{
  "title": "다음 회의",
  "visibility": "PRIVATE",
  "expectedTitle": "기존 회의 이름",
  "expectedVisibility": "PUBLIC"
}
```

반환은 기존 RoomRes `{id,title,visibility}`입니다. 403=호스트 권한 없음, 404=없는 방, 409=회의 종료 또는 설정 충돌, 400=유효성/지원하지 않는 TEAM 전환입니다. 호스트 본인도 종료된 방은 수정할 수 없습니다.

## DB 적용

기존 rooms.title/visibility와 room_events를 사용하므로 ERD 변경이나 새 erd_patch SQL은 없습니다. 기존 erd_patch_v1 요구 사항은 유지합니다. 사용자 로컬 DB에 접속하거나 쿼리를 실행하지 않았습니다.

## 검증

- BE roomContractTest: 96개 통과.
- FE npm test -- --maxWorkers=1: 27개 통과.
- FE npm run build: TypeScript/Vite 통과. 기존 번들 크기 경고는 남아 있습니다.
- tests/room-settings-browser-check.mjs: 34개 검사 통과. 1440/390/360px에서 비공개 생성, 제한 초대, 로그인/가입 복귀, 이름 수정, 참가자 화면 반영, 충돌, 공개 전환 확인 취소/승인, 잠금 유지, 모바일 호스트 설정을 확인했습니다.
- 브라우저 REST/STOMP는 모킹입니다. 실제 PostgreSQL과 연결한 검증을 의미하지 않습니다. 기록은 tests/evidence/room-settings-browser-results.json에 있습니다.

## 로컬 확인

FE/BE를 각각 pull하고 재시작 → 새 회의실에서 비공개 선택 → 제한 초대로 다른 계정 입장 → 호스트 관리에서 이름 변경 → 참가자 화면에 반영 확인 → 두 호스트 탭에서 서로 다른 설정을 저장해 충돌 확인 → 공개 전환 확인을 취소/승인 → 잠금 상태에 따른 신규 번호 입장 확인.
