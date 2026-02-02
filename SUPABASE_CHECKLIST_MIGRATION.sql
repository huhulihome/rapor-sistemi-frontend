-- ============================================
-- GÖREV CHECKLIST ÖZELLİĞİ - SUPABASE MIGRATION
-- ============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- Görevleri alt görevlere bölme ve tik atma özelliği

-- Task Checklist Feature
-- Allows breaking down tasks into smaller checkable items

-- Create task_checklist_items table
CREATE TABLE IF NOT EXISTS task_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_checklist_task_id ON task_checklist_items(task_id);
CREATE INDEX IF NOT EXISTS idx_checklist_position ON task_checklist_items(task_id, position);
CREATE INDEX IF NOT EXISTS idx_checklist_completed ON task_checklist_items(is_completed);

-- RLS policies
ALTER TABLE task_checklist_items ENABLE ROW LEVEL SECURITY;

-- Users can view checklist items for tasks they have access to
CREATE POLICY "Users can view checklist items for accessible tasks"
  ON task_checklist_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_checklist_items.task_id
      AND (
        tasks.assigned_to = auth.uid()
        OR tasks.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    )
  );

-- Users can insert checklist items for tasks they have access to
CREATE POLICY "Users can insert checklist items for accessible tasks"
  ON task_checklist_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_checklist_items.task_id
      AND (
        tasks.assigned_to = auth.uid()
        OR tasks.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    )
  );

-- Users can update checklist items for tasks they have access to
CREATE POLICY "Users can update checklist items for accessible tasks"
  ON task_checklist_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_checklist_items.task_id
      AND (
        tasks.assigned_to = auth.uid()
        OR tasks.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    )
  );

-- Users can delete checklist items for tasks they have access to
CREATE POLICY "Users can delete checklist items for accessible tasks"
  ON task_checklist_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE tasks.id = task_checklist_items.task_id
      AND (
        tasks.assigned_to = auth.uid()
        OR tasks.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      )
    )
  );

-- Trigger to update updated_at
CREATE TRIGGER update_checklist_items_updated_at
  BEFORE UPDATE ON task_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update task progress based on checklist completion
CREATE OR REPLACE FUNCTION update_task_progress_from_checklist()
RETURNS TRIGGER AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
  new_progress INTEGER;
BEGIN
  -- Count total and completed items for this task
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_completed = TRUE)
  INTO total_items, completed_items
  FROM task_checklist_items
  WHERE task_id = COALESCE(NEW.task_id, OLD.task_id);
  
  -- Calculate progress percentage
  IF total_items > 0 THEN
    new_progress := ROUND((completed_items::DECIMAL / total_items::DECIMAL) * 100);
    
    -- Update task progress
    UPDATE tasks
    SET progress_percentage = new_progress,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.task_id, OLD.task_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update task progress when checklist items change
DROP TRIGGER IF EXISTS trigger_update_task_progress ON task_checklist_items;
CREATE TRIGGER trigger_update_task_progress
  AFTER INSERT OR UPDATE OR DELETE ON task_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_task_progress_from_checklist();

-- Comments
COMMENT ON TABLE task_checklist_items IS 'Checklist items for breaking down tasks into smaller steps';
COMMENT ON COLUMN task_checklist_items.position IS 'Order of the item in the checklist (0-indexed)';
COMMENT ON COLUMN task_checklist_items.completed_by IS 'User who completed this checklist item';

-- ============================================
-- BAŞARILI! ✅
-- ============================================
-- Migration tamamlandı. Artık görevlere checklist ekleyebilirsiniz!
-- 
-- Test etmek için:
-- 1. Herhangi bir göreve gidin
-- 2. "Kontrol Listesi" bölümünü görün
-- 3. Yeni öğe ekleyin ve tik atın!
