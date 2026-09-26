-- 수동 복구 전용: 반드시 구버전 BE로 되돌리고 백업 후 실행하세요.
-- 차단 이력과 할 일 버전이 삭제됩니다. 일반 적용 순서에 포함하지 마세요.
BEGIN;
SET LOCAL lock_timeout = '5s';
DROP TABLE IF EXISTS room_bans;
ALTER TABLE action_items DROP COLUMN IF EXISTS revision;
COMMIT;
