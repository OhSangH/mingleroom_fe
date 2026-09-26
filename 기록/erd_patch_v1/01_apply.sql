-- MingleRoom MVP v1 · PostgreSQL · 기존 기록/erd.md 기본 스키마 적용 후 실행
-- 백엔드를 중지하고 DB 백업을 만든 뒤 실행하세요. 오류 시 전체 트랜잭션을 롤백합니다.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
ALTER TABLE action_items ADD COLUMN IF NOT EXISTS revision INTEGER NOT NULL DEFAULT 1;
DO $$ BEGIN
  ALTER TABLE action_items ADD CONSTRAINT ck_action_items_revision CHECK (revision >= 1);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS room_bans (
  room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);
COMMIT;
