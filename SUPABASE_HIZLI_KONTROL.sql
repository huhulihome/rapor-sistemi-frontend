-- ============================================
-- SUPABASE HIZLI KONTROL VE DÜZELTME
-- ============================================
-- Bu dosyayı Supabase SQL Editor'de çalıştırın
-- Tarih: 30 Ocak 2026
-- ============================================

-- ============================================
-- ADIM 1: RECURRING TASK KOLONLARINI KONTROL ET
-- ============================================
-- Bu sorgu recurring task kolonlarının varlığını kontrol eder
-- Beklenen: 7 satır dönmeli

SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN (
    'is_recurring', 
    'recurrence_pattern', 
    'recurrence_interval',
    'recurrence_end_date',
    'task_type',
    'start_time',
    'end_time'
)
ORDER BY column_name;

-- SONUÇ:
-- Eğer 7 satır döndüyse: ✅ Kolonlar mevcut, ADIM 3'e geçin
-- Eğer 0 satır döndüyse: ❌ Kolonlar yok, ADIM 2'yi çalıştırın

-- ============================================
-- ADIM 2: RECURRING TASK KOLONLARINI EKLE
-- ============================================
-- SADECE ADIM 1'de 0 satır döndüyse bu adımı çalıştırın!
-- Bu migration'ı çalıştırmadan önce yorum satırlarını kaldırın

/*
-- Add recurring task fields
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'one_time' CHECK (task_type IN ('one_time', 'routine', 'project'));

-- Add time fields for tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;

-- Add completed_at timestamp
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Create index for recurring tasks
CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON tasks(is_recurring, recurrence_pattern) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
*/

-- ADIM 2'yi çalıştırdıktan sonra ADIM 1'i tekrar çalıştırıp kontrol edin!

-- ============================================
-- ADIM 3: TRIGGER FONKSIYONUNU KONTROL ET
-- ============================================
-- Bu sorgu recurring task trigger fonksiyonunun varlığını kontrol eder
-- Beklenen: 1 satır dönmeli

SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_name = 'create_next_recurring_task'
AND routine_schema = 'public';

-- SONUÇ:
-- Eğer 1 satır döndüyse: ✅ Fonksiyon mevcut, ADIM 5'e geçin
-- Eğer 0 satır döndüyse: ❌ Fonksiyon yok, ADIM 4'ü çalıştırın

-- ============================================
-- ADIM 4: TRIGGER FONKSIYONUNU VE TRIGGER'I OLUŞTUR
-- ============================================
-- SADECE ADIM 3'te 0 satır döndüyse bu adımı çalıştırın!
-- Bu kodu çalıştırmadan önce yorum satırlarını kaldırın

/*
-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS create_recurring_task_trigger ON tasks;

-- Drop existing function if exists
DROP FUNCTION IF EXISTS create_next_recurring_task();

-- Create function to generate next recurring task
CREATE OR REPLACE FUNCTION create_next_recurring_task()
RETURNS TRIGGER AS $$
DECLARE
    next_due_date DATE;
    interval_text TEXT;
BEGIN
    -- Only proceed if task is recurring and being marked as completed
    IF NEW.is_recurring = TRUE 
       AND NEW.status = 'completed' 
       AND (OLD.status IS NULL OR OLD.status != 'completed')
       AND NEW.recurrence_pattern IS NOT NULL THEN
        
        -- Calculate next due date based on pattern and interval
        CASE NEW.recurrence_pattern
            WHEN 'daily' THEN
                interval_text := NEW.recurrence_interval || ' days';
            WHEN 'weekly' THEN
                interval_text := (NEW.recurrence_interval * 7) || ' days';
            WHEN 'biweekly' THEN
                interval_text := (NEW.recurrence_interval * 14) || ' days';
            WHEN 'monthly' THEN
                interval_text := NEW.recurrence_interval || ' months';
            WHEN 'yearly' THEN
                interval_text := NEW.recurrence_interval || ' years';
            ELSE
                interval_text := '1 week'; -- Default fallback
        END CASE;
        
        -- Calculate next due date
        next_due_date := COALESCE(NEW.due_date, CURRENT_DATE) + interval_text::INTERVAL;
        
        -- Check if we should create next task (not past end date)
        IF NEW.recurrence_end_date IS NULL OR next_due_date <= NEW.recurrence_end_date THEN
            -- Insert new recurring task
            INSERT INTO tasks (
                title,
                description,
                category,
                priority,
                assigned_to,
                created_by,
                due_date,
                start_time,
                end_time,
                estimated_hours,
                tags,
                is_recurring,
                recurrence_pattern,
                recurrence_interval,
                recurrence_end_date,
                task_type,
                status,
                progress_percentage
            ) VALUES (
                NEW.title,
                NEW.description,
                NEW.category,
                NEW.priority,
                NEW.assigned_to,
                NEW.created_by,
                next_due_date,
                NEW.start_time,
                NEW.end_time,
                NEW.estimated_hours,
                NEW.tags,
                NEW.is_recurring,
                NEW.recurrence_pattern,
                NEW.recurrence_interval,
                NEW.recurrence_end_date,
                NEW.task_type,
                'not_started',
                0
            );
            
            RAISE NOTICE 'Created next recurring task with due date: %', next_due_date;
        ELSE
            RAISE NOTICE 'Recurring task series ended (past end date: %)', NEW.recurrence_end_date;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER create_recurring_task_trigger
    AFTER UPDATE OF status ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION create_next_recurring_task();

-- Add comment
COMMENT ON FUNCTION create_next_recurring_task() IS 'Automatically creates the next instance of a recurring task when the current one is completed';
*/

-- ADIM 4'ü çalıştırdıktan sonra ADIM 3'ü tekrar çalıştırıp kontrol edin!

-- ============================================
-- ADIM 5: TRIGGER'IN AKTIF OLDUĞUNU KONTROL ET
-- ============================================
-- Bu sorgu trigger'ın aktif olduğunu kontrol eder
-- Beklenen: 1 satır dönmeli

SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'create_recurring_task_trigger'
AND event_object_table = 'tasks';

-- SONUÇ:
-- Eğer 1 satır döndüyse: ✅ Trigger aktif, kurulum tamamlandı!
-- Eğer 0 satır döndüyse: ❌ Trigger yok, ADIM 4'ü tekrar çalıştırın

-- ============================================
-- ADIM 6: TEST - ÖRNEK RECURRING TASK OLUŞTUR
-- ============================================
-- Bu adım opsiyoneldir, test etmek için kullanabilirsiniz
-- Kendi user_id'nizi kullanın!

/*
-- Test için örnek recurring task oluştur
INSERT INTO tasks (
    title,
    description,
    category,
    priority,
    assigned_to,
    created_by,
    due_date,
    start_time,
    end_time,
    is_recurring,
    recurrence_pattern,
    recurrence_interval,
    task_type,
    status
) VALUES (
    'Test Rutin Görev',
    'Bu bir test görevidir',
    'routine',
    'medium',
    'YOUR_USER_ID_HERE', -- Kendi user_id'nizi buraya yazın
    'YOUR_USER_ID_HERE', -- Kendi user_id'nizi buraya yazın
    CURRENT_DATE,
    '09:00:00',
    '17:00:00',
    TRUE,
    'weekly',
    1,
    'routine',
    'not_started'
);

-- Test görevini tamamla ve yeni görev oluştuğunu kontrol et
UPDATE tasks 
SET status = 'completed', 
    completed_at = NOW()
WHERE title = 'Test Rutin Görev' 
AND status = 'not_started';

-- Yeni görevin oluştuğunu kontrol et
SELECT 
    id,
    title,
    due_date,
    status,
    is_recurring,
    recurrence_pattern,
    created_at
FROM tasks
WHERE title = 'Test Rutin Görev'
ORDER BY created_at DESC
LIMIT 2;

-- Beklenen: 2 satır dönmeli (biri completed, biri not_started)
-- not_started olan görevin due_date'i 1 hafta sonra olmalı
*/

-- ============================================
-- ÖZET
-- ============================================
-- 1. ADIM 1'i çalıştır → 7 satır dönüyorsa ADIM 3'e geç
-- 2. ADIM 2'yi çalıştır (eğer gerekirse) → ADIM 1'i tekrar kontrol et
-- 3. ADIM 3'ü çalıştır → 1 satır dönüyorsa ADIM 5'e geç
-- 4. ADIM 4'ü çalıştır (eğer gerekirse) → ADIM 3'ü tekrar kontrol et
-- 5. ADIM 5'i çalıştır → 1 satır dönüyorsa ✅ TAMAMLANDI!
-- 6. ADIM 6 ile test et (opsiyonel)

-- ============================================
-- SORUN GİDERME
-- ============================================
-- Eğer trigger çalışmıyorsa:
-- 1. Supabase Dashboard > Database > Triggers bölümünden kontrol edin
-- 2. Trigger'ı manuel olarak enable edin
-- 3. ADIM 4'ü tekrar çalıştırın

-- Eğer yeni görev oluşmuyorsa:
-- 1. Browser console'da hata var mı kontrol edin
-- 2. Supabase Dashboard > Logs bölümünden hataları kontrol edin
-- 3. Task'ın is_recurring = TRUE olduğundan emin olun
-- 4. Task'ın status = 'completed' olarak güncellendiğinden emin olun

-- ============================================
