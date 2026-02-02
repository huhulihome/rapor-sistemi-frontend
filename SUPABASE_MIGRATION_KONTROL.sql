-- ============================================
-- SUPABASE MIGRATION KONTROL SORGU LARI
-- Bu sorguları Supabase SQL Editor'de çalıştır
-- ============================================

-- 1. TASKS TABLOSU KOLON KONTROLÜ
-- Recurring task kolonları var mı?
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN (
  'is_recurring', 
  'recurrence_pattern', 
  'recurrence_interval',
  'next_occurrence',
  'parent_task_id',
  'recurrence_end_date',
  'last_completed_at',
  'task_type',
  'start_time',
  'end_time'
)
ORDER BY column_name;

-- Beklenen Sonuç: 10 satır dönmeli
-- Eğer daha az satır dönerse, migration çalıştırılmamış demektir


-- 2. TRIGGER KONTROLÜ
-- Recurring task trigger'ı var mı?
SELECT 
  tgname as trigger_name,
  tgenabled as is_enabled,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'trigger_recurring_task';

-- Beklenen Sonuç: 1 satır, is_enabled = 'O' (enabled)
-- Eğer sonuç dönmezse, trigger oluşturulmamış demektir


-- 3. FUNCTION KONTROLÜ
-- create_next_recurring_task fonksiyonu var mı?
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'create_next_recurring_task';

-- Beklenen Sonuç: 1 satır, function definition görünmeli


-- 4. TODOS TABLOSU KONTROLÜ
-- Personal to-do list tablosu var mı?
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'todos'
) as todos_table_exists;

-- Beklenen Sonuç: true


-- 5. TODOS RLS POLICY KONTROLÜ
-- To-do list RLS policies var mı?
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'todos'
ORDER BY policyname;

-- Beklenen Sonuç: 4 policy (SELECT, INSERT, UPDATE, DELETE)


-- 6. MEVCUT RECURRING TASKS KONTROLÜ
-- Sistemde recurring task var mı?
SELECT 
  id,
  title,
  category,
  is_recurring,
  recurrence_pattern,
  recurrence_interval,
  status,
  next_occurrence,
  parent_task_id
FROM tasks
WHERE is_recurring = TRUE
ORDER BY created_at DESC
LIMIT 10;

-- Bu sorgu mevcut recurring task'ları gösterir


-- 7. TEST: RECURRING TASK OLUŞTUR
-- Test için bir recurring task oluştur
INSERT INTO tasks (
  title,
  description,
  category,
  priority,
  status,
  assigned_to,
  created_by,
  is_recurring,
  recurrence_pattern,
  recurrence_interval,
  task_type,
  due_date
) VALUES (
  'Test Rutin Görev - Haftalık',
  'Bu bir test recurring task. Tamamlandığında yeni task oluşmalı.',
  'routine',
  'medium',
  'not_started',
  (SELECT id FROM profiles LIMIT 1), -- İlk kullanıcıya ata
  (SELECT id FROM profiles LIMIT 1),
  TRUE,
  'weekly',
  1,
  'routine',
  NOW() + INTERVAL '7 days'
) RETURNING id, title, is_recurring;

-- Bu sorgu bir test task oluşturur
-- ID'yi kaydet, sonra test için kullanacağız


-- 8. TEST: TASK'I TAMAMLA VE YENİ TASK OLUŞMASINI İZLE
-- Yukarıdaki test task'ın ID'sini buraya yaz
-- UPDATE tasks 
-- SET status = 'completed'
-- WHERE id = 'BURAYA_TEST_TASK_ID_YAZ';

-- Sonra kontrol et:
-- SELECT id, title, status, is_recurring, parent_task_id, created_at
-- FROM tasks
-- WHERE title LIKE '%Test Rutin Görev%'
-- ORDER BY created_at DESC;

-- Beklenen: 2 task görünmeli
-- 1. Completed olan (orijinal)
-- 2. Not_started olan (yeni oluşan)


-- ============================================
-- SORUN GİDERME
-- ============================================

-- Eğer kolonlar yoksa, şu migration'ı çalıştır:
-- supabase/migrations/005_recurring_tasks.sql

-- Eğer trigger çalışmıyorsa, şu migration'ı çalıştır:
-- supabase/migrations/008_fix_recurring_task_trigger.sql

-- Eğer todos tablosu yoksa, şu migration'ı çalıştır:
-- supabase/migrations/009_todos_table.sql

