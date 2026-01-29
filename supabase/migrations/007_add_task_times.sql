-- Migration: Add time fields to tasks and improve task tracking
-- Run this in Supabase SQL Editor

-- Add start_time and end_time columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME;

-- Add index for time-based queries
CREATE INDEX IF NOT EXISTS idx_tasks_end_time ON tasks(end_time);

-- Comment explaining usage
COMMENT ON COLUMN tasks.start_time IS 'Optional start time for the task (HH:MM format)';
COMMENT ON COLUMN tasks.end_time IS 'Optional end time/deadline time for the task (HH:MM format) - used for same-day deadline calculations';
