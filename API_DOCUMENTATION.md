# Modern Office System - API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)
8. [Examples](#examples)

---

## Overview

### Base URL

```
Production: https://your-backend.railway.app/api
Staging: https://your-backend-staging.railway.app/api
Development: http://localhost:3000/api
```

### API Version

Current version: `v1`

### Content Type

All requests and responses use JSON:
```
Content-Type: application/json
```

### Authentication

All API endpoints (except `/auth/login` and `/auth/register`) require authentication using JWT tokens.

---

## Authentication

### Login

Authenticate a user and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "employee",
    "department": "IT"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid credentials
- `401 Unauthorized` - Invalid email or password

### Register

Create a new user account (admin only).

**Endpoint:** `POST /auth/register`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "full_name": "Jane Smith",
  "role": "employee",
  "department": "Marketing"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "full_name": "Jane Smith",
  "role": "employee",
  "department": "Marketing"
}
```

### Logout

Invalidate the current session.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

### Refresh Token

Get a new JWT token before the current one expires.

**Endpoint:** `POST /auth/refresh`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## API Endpoints

### Tasks

#### Get All Tasks

Retrieve a list of tasks. Employees see only their tasks, admins see all tasks.

**Endpoint:** `GET /tasks`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional) - Filter by status: `not_started`, `in_progress`, `completed`, `blocked`
- `priority` (optional) - Filter by priority: `low`, `medium`, `high`, `critical`
- `category` (optional) - Filter by category: `routine`, `project`, `one_time`, `issue_resolution`
- `assigned_to` (optional) - Filter by assignee ID (admin only)
- `limit` (optional) - Number of results (default: 50, max: 100)
- `offset` (optional) - Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Fix printer in Room 301",
      "description": "Printer is not responding",
      "category": "issue_resolution",
      "priority": "high",
      "status": "in_progress",
      "progress_percentage": 50,
      "assigned_to": "uuid",
      "created_by": "uuid",
      "related_issue_id": "uuid",
      "due_date": "2026-01-20T00:00:00Z",
      "estimated_hours": 2,
      "actual_hours": 1,
      "tags": ["printer", "hardware"],
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T14:30:00Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

#### Get Task by ID

Retrieve a specific task.

**Endpoint:** `GET /tasks/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Fix printer in Room 301",
  "description": "Printer is not responding",
  "category": "issue_resolution",
  "priority": "high",
  "status": "in_progress",
  "progress_percentage": 50,
  "assigned_to": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com"
  },
  "created_by": {
    "id": "uuid",
    "full_name": "Admin User",
    "email": "admin@example.com"
  },
  "related_issue_id": "uuid",
  "due_date": "2026-01-20T00:00:00Z",
  "estimated_hours": 2,
  "actual_hours": 1,
  "tags": ["printer", "hardware"],
  "attachments": [],
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-15T14:30:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Task not found
- `403 Forbidden` - Not authorized to view this task

#### Create Task

Create a new task (admin only).

**Endpoint:** `POST /tasks`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Update website content",
  "description": "Update homepage with new product information",
  "category": "project",
  "priority": "medium",
  "assigned_to": "uuid",
  "due_date": "2026-01-25T00:00:00Z",
  "estimated_hours": 4,
  "tags": ["website", "content"]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Update website content",
  "description": "Update homepage with new product information",
  "category": "project",
  "priority": "medium",
  "status": "not_started",
  "progress_percentage": 0,
  "assigned_to": "uuid",
  "created_by": "uuid",
  "due_date": "2026-01-25T00:00:00Z",
  "estimated_hours": 4,
  "tags": ["website", "content"],
  "created_at": "2026-01-15T15:00:00Z",
  "updated_at": "2026-01-15T15:00:00Z"
}
```

#### Update Task

Update an existing task.

**Endpoint:** `PUT /tasks/:id`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "in_progress",
  "progress_percentage": 75,
  "actual_hours": 3,
  "notes": "Almost complete, just need final review"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Update website content",
  "status": "in_progress",
  "progress_percentage": 75,
  "actual_hours": 3,
  "updated_at": "2026-01-15T16:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Task not found
- `403 Forbidden` - Not authorized to update this task
- `400 Bad Request` - Invalid data

#### Delete Task

Delete a task (admin only).

**Endpoint:** `DELETE /tasks/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found` - Task not found
- `403 Forbidden` - Not authorized to delete tasks

---

### Issues

#### Get All Issues

Retrieve a list of issues. Employees see their own issues, admins see all.

**Endpoint:** `GET /issues`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional) - Filter by status: `pending_assignment`, `assigned`, `in_progress`, `resolved`, `closed`
- `priority` (optional) - Filter by priority: `low`, `medium`, `high`, `critical`
- `reported_by` (optional) - Filter by reporter ID
- `assigned_to` (optional) - Filter by assignee ID
- `limit` (optional) - Number of results (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "issues": [
    {
      "id": "uuid",
      "title": "Printer not working",
      "description": "Printer in Room 301 is not responding",
      "priority": "high",
      "status": "pending_assignment",
      "reported_by": {
        "id": "uuid",
        "full_name": "Jane Smith",
        "email": "jane@example.com"
      },
      "suggested_assignee": {
        "id": "uuid",
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "created_at": "2026-01-15T09:00:00Z",
      "updated_at": "2026-01-15T09:00:00Z"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

#### Get Issue by ID

Retrieve a specific issue.

**Endpoint:** `GET /issues/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Printer not working",
  "description": "Printer in Room 301 is not responding. Tried restarting but no luck.",
  "priority": "high",
  "status": "assigned",
  "reported_by": {
    "id": "uuid",
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "department": "Marketing"
  },
  "suggested_assignee": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com"
  },
  "assigned_to": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com"
  },
  "assigned_at": "2026-01-15T10:00:00Z",
  "attachments": [],
  "created_at": "2026-01-15T09:00:00Z",
  "updated_at": "2026-01-15T10:00:00Z"
}
```

#### Create Issue

Report a new issue.

**Endpoint:** `POST /issues`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "AC not cooling in Conference Room",
  "description": "The air conditioning in Conference Room B is not cooling properly. Temperature is 28°C.",
  "priority": "high",
  "suggested_assignee_id": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "AC not cooling in Conference Room",
  "description": "The air conditioning in Conference Room B is not cooling properly. Temperature is 28°C.",
  "priority": "high",
  "status": "pending_assignment",
  "reported_by": "uuid",
  "suggested_assignee_id": "uuid",
  "created_at": "2026-01-15T11:00:00Z",
  "updated_at": "2026-01-15T11:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or invalid data
- `404 Not Found` - Suggested assignee not found

#### Assign Issue

Assign an issue to a user and create a task (admin only).

**Endpoint:** `PUT /issues/:id/assign`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "assignee_id": "uuid",
  "edited_issue": {
    "title": "AC not cooling in Conference Room B",
    "description": "Updated description with more details",
    "priority": "critical"
  }
}
```

**Response:** `200 OK`
```json
{
  "issue": {
    "id": "uuid",
    "status": "assigned",
    "assigned_to": "uuid",
    "assigned_at": "2026-01-15T12:00:00Z"
  },
  "task": {
    "id": "uuid",
    "title": "AC not cooling in Conference Room B",
    "category": "issue_resolution",
    "assigned_to": "uuid",
    "related_issue_id": "uuid"
  },
  "message": "Issue successfully assigned and task created"
}
```

**Error Responses:**
- `404 Not Found` - Issue or assignee not found
- `403 Forbidden` - Not authorized (admin only)
- `400 Bad Request` - Issue already assigned

#### Update Issue Status

Update the status of an issue.

**Endpoint:** `PATCH /issues/:id/status`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "resolved",
  "resolution_notes": "Replaced AC filter and recharged coolant"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "resolved",
  "resolved_at": "2026-01-15T16:00:00Z",
  "resolution_notes": "Replaced AC filter and recharged coolant"
}
```

---

### Users/Profiles

#### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "employee",
  "department": "IT",
  "avatar_url": "https://storage.url/avatar.jpg",
  "notification_preferences": {
    "email": true,
    "push": true
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2026-01-15T10:00:00Z"
}
```

#### Update Profile

Update the authenticated user's profile.

**Endpoint:** `PUT /users/me`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "full_name": "John Smith",
  "department": "Engineering",
  "notification_preferences": {
    "email": true,
    "push": false
  }
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Smith",
  "department": "Engineering",
  "notification_preferences": {
    "email": true,
    "push": false
  },
  "updated_at": "2026-01-15T12:00:00Z"
}
```

#### Get All Users

Get a list of all users (admin only).

**Endpoint:** `GET /users`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Parameters:**
- `role` (optional) - Filter by role: `admin`, `employee`
- `department` (optional) - Filter by department
- `limit` (optional) - Number of results (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "employee",
      "department": "IT",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

---

### Analytics

#### Get Dashboard Statistics

Get overview statistics for the dashboard.

**Endpoint:** `GET /analytics/dashboard`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` (optional) - Start date for metrics (ISO 8601)
- `end_date` (optional) - End date for metrics (ISO 8601)

**Response:** `200 OK`
```json
{
  "tasks": {
    "total": 150,
    "not_started": 20,
    "in_progress": 45,
    "completed": 80,
    "blocked": 5,
    "overdue": 10,
    "completion_rate": 53.3
  },
  "issues": {
    "total": 75,
    "pending_assignment": 5,
    "assigned": 15,
    "in_progress": 20,
    "resolved": 30,
    "closed": 5,
    "average_resolution_time_hours": 24
  },
  "user_stats": {
    "total_users": 25,
    "active_users": 20,
    "tasks_per_user": 6
  }
}
```

#### Get Task Completion Trend

Get task completion data over time.

**Endpoint:** `GET /analytics/task-completion-trend`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `start_date` (required) - Start date (ISO 8601)
- `end_date` (required) - End date (ISO 8601)
- `interval` (optional) - Data interval: `day`, `week`, `month` (default: `day`)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "date": "2026-01-01",
      "completed": 5,
      "created": 8
    },
    {
      "date": "2026-01-02",
      "completed": 7,
      "created": 6
    }
  ]
}
```

#### Get User Workload Distribution

Get workload distribution across users.

**Endpoint:** `GET /analytics/user-workload`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "user_id": "uuid",
      "full_name": "John Doe",
      "total_tasks": 12,
      "in_progress": 5,
      "completed": 7,
      "completion_rate": 58.3
    }
  ]
}
```

#### Get Issue Priority Breakdown

Get distribution of issues by priority.

**Endpoint:** `GET /analytics/issue-priority-breakdown`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "priority": "critical",
      "count": 5
    },
    {
      "priority": "high",
      "count": 15
    },
    {
      "priority": "medium",
      "count": 30
    },
    {
      "priority": "low",
      "count": 25
    }
  ]
}
```

---

## Data Models

### User/Profile

```typescript
interface Profile {
  id: string;                    // UUID
  email: string;                 // Unique email
  full_name: string;             // Full name
  role: 'admin' | 'employee';    // User role
  department?: string;           // Department name
  avatar_url?: string;           // Avatar image URL
  notification_preferences: {
    email: boolean;
    push: boolean;
  };
  created_at: string;            // ISO 8601 timestamp
  updated_at: string;            // ISO 8601 timestamp
}
```

### Task

```typescript
interface Task {
  id: string;                                                    // UUID
  title: string;                                                 // Task title
  description?: string;                                          // Task description
  category: 'routine' | 'project' | 'one_time' | 'issue_resolution';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  progress_percentage: number;                                   // 0-100
  assigned_to?: string;                                          // User ID
  created_by: string;                                            // User ID
  related_issue_id?: string;                                     // Issue ID if created from issue
  due_date?: string;                                             // ISO 8601 timestamp
  estimated_hours?: number;                                      // Estimated time
  actual_hours?: number;                                         // Actual time spent
  tags: string[];                                                // Array of tags
  attachments: Attachment[];                                     // Array of attachments
  created_at: string;                                            // ISO 8601 timestamp
  updated_at: string;                                            // ISO 8601 timestamp
}
```

### Issue

```typescript
interface Issue {
  id: string;                                                    // UUID
  title: string;                                                 // Issue title
  description: string;                                           // Issue description
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending_assignment' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  reported_by: string;                                           // User ID
  suggested_assignee_id: string;                                 // User ID
  assigned_to?: string;                                          // User ID
  assigned_at?: string;                                          // ISO 8601 timestamp
  resolved_at?: string;                                          // ISO 8601 timestamp
  resolution_notes?: string;                                     // Resolution details
  attachments: Attachment[];                                     // Array of attachments
  created_at: string;                                            // ISO 8601 timestamp
  updated_at: string;                                            // ISO 8601 timestamp
}
```

### Attachment

```typescript
interface Attachment {
  id: string;                    // UUID
  filename: string;              // Original filename
  url: string;                   // Storage URL
  size: number;                  // File size in bytes
  mime_type: string;             // MIME type
  uploaded_at: string;           // ISO 8601 timestamp
}
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content to return
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate)
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily unavailable

### Common Error Codes

- `AUTH_REQUIRED` - Authentication required
- `AUTH_INVALID` - Invalid credentials
- `AUTH_EXPIRED` - Token expired
- `PERMISSION_DENIED` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `DUPLICATE_ENTRY` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SERVER_ERROR` - Internal server error

### Example Error Responses

**Validation Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "title": "Title is required",
      "priority": "Priority must be one of: low, medium, high, critical"
    }
  }
}
```

**Authentication Error:**
```json
{
  "error": {
    "code": "AUTH_INVALID",
    "message": "Invalid email or password"
  }
}
```

**Permission Error:**
```json
{
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "You do not have permission to perform this action"
  }
}
```

---

## Rate Limiting

### Rate Limits

- **Authentication endpoints:** 5 requests per minute
- **Read endpoints (GET):** 100 requests per minute
- **Write endpoints (POST/PUT/DELETE):** 30 requests per minute

### Rate Limit Headers

Response includes rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642262400
```

### Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

---

## Webhooks

### Webhook Events

Subscribe to real-time events:

- `task.created` - New task created
- `task.updated` - Task updated
- `task.completed` - Task marked as completed
- `issue.created` - New issue reported
- `issue.assigned` - Issue assigned to user
- `issue.resolved` - Issue resolved

### Webhook Payload

```json
{
  "event": "task.created",
  "timestamp": "2026-01-15T10:00:00Z",
  "data": {
    "id": "uuid",
    "title": "New task",
    "assigned_to": "uuid"
  }
}
```

### Webhook Configuration

Contact your administrator to configure webhooks for your organization.

---

## Examples

### Complete Task Workflow

```javascript
// 1. Login
const loginResponse = await fetch('https://api.example.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { token } = await loginResponse.json();

// 2. Get tasks
const tasksResponse = await fetch('https://api.example.com/api/tasks?status=in_progress', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { tasks } = await tasksResponse.json();

// 3. Update task
const updateResponse = await fetch(`https://api.example.com/api/tasks/${tasks[0].id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'completed',
    progress_percentage: 100
  })
});
```

### Complete Issue Workflow

```javascript
// 1. Employee creates issue
const issueResponse = await fetch('https://api.example.com/api/issues', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${employeeToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Printer not working',
    description: 'Printer in Room 301 is offline',
    priority: 'high',
    suggested_assignee_id: 'tech-user-id'
  })
});
const issue = await issueResponse.json();

// 2. Admin assigns issue
const assignResponse = await fetch(`https://api.example.com/api/issues/${issue.id}/assign`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    assignee_id: 'tech-user-id'
  })
});
const { task } = await assignResponse.json();

// 3. Assignee completes task
const completeResponse = await fetch(`https://api.example.com/api/tasks/${task.id}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${techToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'completed',
    progress_percentage: 100,
    actual_hours: 1
  })
});
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ModernOfficeClient } from '@modern-office/sdk';

const client = new ModernOfficeClient({
  baseUrl: 'https://api.example.com/api',
  token: 'your-jwt-token'
});

// Get tasks
const tasks = await client.tasks.list({ status: 'in_progress' });

// Create issue
const issue = await client.issues.create({
  title: 'Network issue',
  description: 'Cannot access shared drive',
  priority: 'high',
  suggested_assignee_id: 'user-id'
});

// Update task
await client.tasks.update('task-id', {
  status: 'completed',
  progress_percentage: 100
});
```

### Python

```python
from modern_office import Client

client = Client(
    base_url='https://api.example.com/api',
    token='your-jwt-token'
)

# Get tasks
tasks = client.tasks.list(status='in_progress')

# Create issue
issue = client.issues.create(
    title='Network issue',
    description='Cannot access shared drive',
    priority='high',
    suggested_assignee_id='user-id'
)

# Update task
client.tasks.update('task-id', {
    'status': 'completed',
    'progress_percentage': 100
})
```

---

## Support

For API support, contact:
- Email: api-support@your-company.com
- Documentation: https://docs.your-company.com
- Status Page: https://status.your-company.com

---

*API Version: 1.0*
*Last Updated: January 2026*
