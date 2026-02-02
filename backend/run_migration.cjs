const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const sql = `CREATE OR REPLACE FUNCTION create_next_recurring_task()
RETURNS TRIGGER AS $$
DECLARE
  new_due_date TIMESTAMPTZ;
  new_task_id UUID;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.is_recurring = TRUE THEN
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
    
    IF NEW.recurrence_end_date IS NOT NULL AND new_due_date > NEW.recurrence_end_date THEN
      UPDATE tasks SET is_recurring = FALSE, next_occurrence = NULL WHERE id = NEW.id;
      RETURN NEW;
    END IF;
    
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
    
    UPDATE tasks SET 
      last_completed_at = NOW(),
      next_occurrence = new_due_date,
      is_recurring = FALSE
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;`;

const client = new Client({
  connectionString: 'postgresql://postgres:Huhuli123456@db.hyhazfecabmugxkpkutm.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');
    const result = await client.query(sql);
    console.log('Migration executed successfully!');
    console.log('Function create_next_recurring_task() has been updated.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
