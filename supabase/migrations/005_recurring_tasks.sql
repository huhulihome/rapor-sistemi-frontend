-- Recurring Tasks Migration
-- Adds support for routine/project tasks with automatic recurrence

-- Add recurring task fields to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'one_time' 
  CHECK (task_type IN ('one_time', 'routine', 'project'));

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT 
  CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly'));

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS next_occurrence TIMESTAMPTZ;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMPTZ;

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_completed_at TIMESTAMPTZ;

-- Index for recurring tasks
CREATE INDEX IF NOT EXISTS idx_tasks_recurring ON tasks(is_recurring, next_occurrence) 
  WHERE is_recurring = TRUE;

CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);

-- Function to create next occurrence for recurring tasks
CREATE OR REPLACE FUNCTION create_next_recurring_task()
RETURNS TRIGGER AS $$
DECLARE
  new_due_date TIMESTAMPTZ;
  new_task_id UUID;
BEGIN
  -- Only process recurring tasks that are completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.is_recurring = TRUE THEN
    
    -- Calculate next due date based on recurrence pattern
    CASE NEW.recurrence_pattern
      WHEN 'daily' THEN
        new_due_date := COALESCE(NEW.due_date, NOW()) + (NEW.recurrence_interval || ' days')::INTERVAL;
      WHEN 'weekly' THEN
        new_due_date := COALESCE(NEW.due_date, NOW()) + (NEW.recurrence_interval * 7 || ' days')::INTERVAL;
      WHEN 'biweekly' THEN
        new_due_date := COALESCE(NEW.due_date, NOW()) + '14 days'::INTERVAL;
      WHEN 'monthly' THEN
        new_due_date := COALESCE(NEW.due_date, NOW()) + (NEW.recurrence_interval || ' months')::INTERVAL;
      WHEN 'yearly' THEN
        new_due_date := COALESCE(NEW.due_date, NOW()) + (NEW.recurrence_interval || ' years')::INTERVAL;
      ELSE
        new_due_date := NULL;
    END CASE;
    
    -- Check if recurrence should end
    IF NEW.recurrence_end_date IS NOT NULL AND new_due_date > NEW.recurrence_end_date THEN
      -- Update the task to not recurring anymore
      UPDATE tasks SET is_recurring = FALSE, next_occurrence = NULL WHERE id = NEW.id;
      RETURN NEW;
    END IF;
    
    -- Create the next occurrence
    INSERT INTO tasks (
      title, description, category, priority, assigned_to, created_by,
      due_date, status, is_recurring, recurrence_pattern, recurrence_interval,
      recurrence_end_date, parent_task_id, task_type
    ) VALUES (
      NEW.title, NEW.description, NEW.category, NEW.priority, NEW.assigned_to, NEW.created_by,
      new_due_date, 'not_started', TRUE, NEW.recurrence_pattern, NEW.recurrence_interval,
      NEW.recurrence_end_date, COALESCE(NEW.parent_task_id, NEW.id), NEW.task_type
    ) RETURNING id INTO new_task_id;
    
    -- Update completed task
    UPDATE tasks SET 
      last_completed_at = NOW(),
      next_occurrence = new_due_date
    WHERE id = NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for recurring tasks
DROP TRIGGER IF EXISTS trigger_recurring_task ON tasks;
CREATE TRIGGER trigger_recurring_task
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION create_next_recurring_task();

-- Comment
COMMENT ON COLUMN tasks.task_type IS 'Type: one_time, routine (recurring), project';
COMMENT ON COLUMN tasks.is_recurring IS 'Whether this task repeats automatically';
COMMENT ON COLUMN tasks.recurrence_pattern IS 'Pattern: daily, weekly, biweekly, monthly, yearly';
COMMENT ON COLUMN tasks.recurrence_interval IS 'Interval multiplier (e.g., 2 = every 2 weeks)';
COMMENT ON COLUMN tasks.next_occurrence IS 'When the next instance will be created';
