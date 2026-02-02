-- Deadlines table for independent reminder/calendar system
-- Separate from tasks - for manual date-based reminders with CSV import/export support

-- Create deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  deadline_date DATE NOT NULL,
  reminder_date DATE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  category TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_deadlines_deadline_date ON deadlines(deadline_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_reminder_date ON deadlines(reminder_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_created_by ON deadlines(created_by);
CREATE INDEX IF NOT EXISTS idx_deadlines_is_completed ON deadlines(is_completed);

-- RLS policies
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

-- Users can view their own deadlines, admins can view all
CREATE POLICY "Users can view own deadlines"
  ON deadlines FOR SELECT
  USING (
    auth.uid() = created_by 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can insert their own deadlines
CREATE POLICY "Users can insert own deadlines"
  ON deadlines FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own deadlines, admins can update all
CREATE POLICY "Users can update own deadlines"
  ON deadlines FOR UPDATE
  USING (
    auth.uid() = created_by 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can delete their own deadlines, admins can delete all
CREATE POLICY "Users can delete own deadlines"
  ON deadlines FOR DELETE
  USING (
    auth.uid() = created_by 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Comment
COMMENT ON TABLE deadlines IS 'Independent deadline/reminder system with CSV import/export support. Not tied to tasks.';
