// API request/response types
export interface CreateIssueRequest {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggested_assignee_id: string;
}

export interface AssignIssueRequest {
  assignee_id: string;
  edited_issue?: {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  category: 'routine' | 'project' | 'one_time' | 'issue_resolution';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  due_date?: string;
  start_time?: string;
  end_time?: string;
  estimated_hours?: number;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress_percentage?: number;
  actual_hours?: number;
  completed_at?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
