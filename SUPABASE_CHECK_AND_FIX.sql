-- =====================================================
-- 檢查並修復 collaborations 表格欄位問題
-- =====================================================

-- 步驟 1: 檢查現有欄位
-- =====================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'collaborations'
ORDER BY ordinal_position;

-- =====================================================
-- 如果上面的查詢顯示缺少欄位，請執行以下 SQL：
-- =====================================================

-- 步驟 2: 刪除可能存在的約束條件
-- =====================================================
DO $$
BEGIN
    -- 刪除 contract_status 的檢查約束（如果存在）
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname LIKE '%contract_status%'
        AND conrelid = 'collaborations'::regclass
    ) THEN
        ALTER TABLE collaborations
        DROP CONSTRAINT IF EXISTS collaborations_contract_status_check;
    END IF;
END $$;

-- 步驟 3: 新增或更新欄位
-- =====================================================

-- 3.1 新增 contract_status 欄位
DO $$
BEGIN
    -- 檢查欄位是否存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'collaborations'
        AND column_name = 'contract_status'
    ) THEN
        -- 欄位不存在，新增它
        ALTER TABLE collaborations
        ADD COLUMN contract_status VARCHAR(20) DEFAULT 'none';

        RAISE NOTICE '✓ 已新增 contract_status 欄位';
    ELSE
        RAISE NOTICE '✓ contract_status 欄位已存在';
    END IF;
END $$;

-- 3.2 新增 collaboration_process 欄位
DO $$
BEGIN
    -- 檢查欄位是否存在
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'collaborations'
        AND column_name = 'collaboration_process'
    ) THEN
        -- 欄位不存在，新增它
        ALTER TABLE collaborations
        ADD COLUMN collaboration_process JSONB DEFAULT '{}'::jsonb;

        RAISE NOTICE '✓ 已新增 collaboration_process 欄位';
    ELSE
        RAISE NOTICE '✓ collaboration_process 欄位已存在';
    END IF;
END $$;

-- 步驟 4: 更新現有資料的預設值
-- =====================================================
UPDATE collaborations
SET contract_status = 'none'
WHERE contract_status IS NULL;

UPDATE collaborations
SET collaboration_process = '{}'::jsonb
WHERE collaboration_process IS NULL;

-- 步驟 5: 新增約束條件（可選）
-- =====================================================
DO $$
BEGIN
    -- 只有在約束不存在時才新增
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'collaborations_contract_status_check'
    ) THEN
        ALTER TABLE collaborations
        ADD CONSTRAINT collaborations_contract_status_check
        CHECK (contract_status IN ('none', 'draft', 'pending_signature', 'signed', 'expired'));

        RAISE NOTICE '✓ 已新增 contract_status 約束';
    END IF;
END $$;

-- 步驟 6: 重新整理 PostgREST schema cache
-- =====================================================
NOTIFY pgrst, 'reload schema';

-- 步驟 7: 再次檢查欄位
-- =====================================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'collaborations'
AND column_name IN ('contract_status', 'collaboration_process')
ORDER BY ordinal_position;

-- =====================================================
-- 完成！
-- =====================================================
-- 請確認最後的查詢結果顯示兩個欄位都存在
-- =====================================================
