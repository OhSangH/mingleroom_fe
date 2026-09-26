-- 두 컬럼의 타입/기본값과 4개 제약조건을 확인합니다. 읽기 전용입니다.
SELECT table_name,column_name,data_type,is_nullable,column_default
FROM information_schema.columns
WHERE table_schema=current_schema() AND
 ((table_name='action_items' AND column_name='revision') OR table_name='room_bans')
ORDER BY table_name,ordinal_position;
SELECT conrelid::regclass AS table_name, conname, pg_get_constraintdef(oid)
FROM pg_constraint WHERE conrelid IN ('room_bans'::regclass,'action_items'::regclass)
AND (conrelid='room_bans'::regclass OR conname='ck_action_items_revision');
SELECT count(*) AS invalid_revision_count FROM action_items WHERE revision IS NULL OR revision < 1;
