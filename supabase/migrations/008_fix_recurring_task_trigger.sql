-- Migration: Fix recurring task trigger to include all necessary columns
-- This fixes the "invalid input syntax for type json" error when completing recurring tasks
-- Run this in Supabase SQL Editor

-- Drop and recreate the function with all required columns
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
    
    -- Create the next occurrence with ALL necessary columns including tags, times, and estimated_hours
    INSERT INTO tasks (
      title, description, category, priority, assigned_to, created_by,
      due_date, status, is_recurring, recurrence_pattern, recurrence_interval,
      recurrence_end_date, parent_task_id, task_type,
      tags, estimated_hours, start_time, end_time
    ) VALUES (
      NEW.title, NEW.description, NEW.category, NEW.priority, NEW.assigned_to, NEW.created_by,
      new_due_date, 'not_started', TRUE, NEW.recurrence_pattern, NEW.recurrence_interval,
      NEW.recurrence_end_date, COALESCE(NEW.parent_task_id, NEW.id), NEW.task_type,
      NEW.tags, NEW.estimated_hours, NEW.start_time, NEW.end_time
    ) RETURNING id INTO new_task_id;
    
    -- Update completed task
    UPDATE tasks SET 
      last_completed_at = NOW(),
      next_occurrence = new_due_date,
      is_recurring = FALSE  -- Mark original as not recurring since new instance is created
    WHERE id = NEW.id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger already exists, no need to recreate it
-- Just updating the function is enough
