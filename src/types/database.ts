// Core data types
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'employee';
  department?: string;
  avatar_url?: string;
  notification_preferences: {
    email: boolean;
    push: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'routine' | 'project' | 'one_time' | 'issue_resolution';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress_percentage: number;
  assigned_to?: string;
  created_by: string;
  related_issue_id?: string;
  due_date?: string;
  start_time?: string;  // HH:MM format
  end_time?: string;    // HH:MM format - task should complete by this time
  estimated_hours?: number;
  actual_hours?: number;
  tags: string[];
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending_assignment' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  reported_by: string;
  suggested_assignee_id: string;
  assigned_to?: string;
  assigned_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: 'task' | 'issue' | 'user';
  entity_id: string;
  details?: Record<string, any>;
  created_at: string;
}
