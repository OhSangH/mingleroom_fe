# erd_patch_v1 — 회의 도구 / 호스트 제어

이 SQL은 사용자 로컬 DB에서 직접 실행합니다. 개발 작업 중 실제 DB에는 접속하거나 쿼리를 실행하지 않았습니다.

## 적용 순서

1. DB를 백업하고 백엔드를 중지합니다.
2. 기존 `기록/erd.md`의 기본 테이블이 생성된 DB인지 확인합니다. 이 패치는 새 DB 전체 생성용이 아닙니다.
3. DB 클라이언트에서 `01_apply.sql` 전체를 실행합니다. psql이면 `psql -v ON_ERROR_STOP=1 -d <DB명> -f 01_apply.sql`.
4. `02_verify.sql`을 실행합니다. `action_items.revision`은 NOT NULL/default 1, `room_bans`의 복합 PK/FK, 잘못된 revision 수 0을 확인합니다.
5. 최신 BE/FE를 pull하고 백엔드를 시작합니다. `ddl-auto` 자동 변경에 의존하지 않습니다.
6. 회의록 저장·새로고침, 할 일 수정, 투표 변경/마감, 초대 횟수 소진, 내보낸 계정 재입장을 시험합니다.

## 변경 사항

- `action_items.revision INTEGER NOT NULL DEFAULT 1`: 동시 수정 시 409로 충돌을 알립니다. 기존 행은 1로 초기화됩니다.
- `room_bans(room_id,user_id,created_at)`: 호스트가 내보낸 계정의 재입장을 차단합니다. 방/사용자 삭제 시 함께 삭제됩니다.
- 회의록, 투표, 북마크, 초대는 기존 테이블을 사용합니다. 기존 초대 token 컬럼에 신규 토큰의 SHA-256 해시를 저장합니다. 이번 API가 발급한 링크만 redeem 대상으로 사용합니다.

`IF NOT EXISTS`는 재실행을 돕지만, 기존에 같은 이름의 다른 구조가 있다면 검증 후 조정해야 합니다. 데이터는 삭제하지 않습니다. `99_rollback_manual.sql`은 필요할 때만 수동 실행하는 파괴적 복구 스크립트입니다.

실제 PostgreSQL 적용은 아직 검증하지 못했습니다. 오류가 있으면 COMMIT하지 말고 ROLLBACK 후 메시지를 확인하세요.
