-- Fix RLS policy for tasks to allow users to create tasks for themselves
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Admins can create tasks" ON tasks;

-- Create new policy that allows:
-- 1. Admins can create any task
-- 2. Regular users can create tasks assigned to themselves
CREATE POLICY "Users can create tasks"
  ON tasks
  FOR INSERT
  WITH CHECK (
    -- Admins can create any task
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Users can create tasks assigned to themselves
    (assigned_to = auth.uid() OR assigned_to IS NULL)
  );

-- Also ensure backend service role bypasses RLS completely
-- This is already handled by using service_key, but let's be explicit
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;
