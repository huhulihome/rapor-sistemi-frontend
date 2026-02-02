# Modern Office System - User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Employee Guide](#employee-guide)
4. [Admin Guide](#admin-guide)
5. [Mobile App Usage](#mobile-app-usage)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## Introduction

### What is Modern Office System?

Modern Office System is a comprehensive office management application that helps teams manage tasks, report issues, and track progress efficiently. The system features:

- **Task Management** - Create, assign, and track tasks
- **Smart Issue Reporting** - Report problems and suggest solutions
- **Real-time Updates** - See changes instantly
- **Mobile Support** - Access from any device
- **Analytics Dashboard** - Track team performance

### System Requirements

**Web Browser:**
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Devices:**
- iOS 14+ (iPhone/iPad)
- Android 10+

**Internet Connection:**
- Minimum 1 Mbps
- Recommended 5 Mbps for optimal performance

---

## Getting Started

### Accessing the System

1. Open your web browser
2. Navigate to: `https://your-office-system.vercel.app`
3. You will see the login page

### First Time Login

1. Enter your email address (provided by your administrator)
2. Enter your temporary password (provided by your administrator)
3. Click "Giriş Yap" (Login)
4. You will be prompted to change your password
5. Enter a new secure password
6. Click "Şifreyi Güncelle" (Update Password)

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Navigating the Interface

**Main Navigation (Sidebar):**
- **Dashboard** - Overview of your work
- **Görevlerim** (My Tasks) - Your assigned tasks
- **Sorunlar** (Issues) - Report and view issues
- **Profil** (Profile) - Your account settings

**Top Bar:**
- **Notification Bell** - View notifications
- **User Menu** - Access profile and logout

---

## Employee Guide

### Dashboard Overview

When you log in, you'll see your personal dashboard with:

- **Task Statistics** - Total, in progress, and completed tasks
- **Pending Issues** - Issues you've reported
- **Recent Activity** - Latest updates
- **Quick Actions** - Common tasks

### Managing Tasks

#### Viewing Your Tasks

1. Click "Görevlerim" in the sidebar
2. You'll see a list of all tasks assigned to you
3. Each task card shows:
   - Task title
   - Priority level (Low, Medium, High, Critical)
   - Status (Not Started, In Progress, Completed, Blocked)
   - Due date
   - Progress percentage

#### Filtering Tasks

Use the filter options at the top:

- **Status Filter** - Show only tasks with specific status
- **Priority Filter** - Filter by priority level
- **Category Filter** - Filter by task type
- **Date Range** - Show tasks within date range

#### Updating a Task

1. Click on a task card to open details
2. Update the following fields:
   - **Status** - Change task status
   - **Progress** - Update completion percentage (0-100%)
   - **Time Spent** - Log hours worked
   - **Notes** - Add progress notes
3. Click "Kaydet" (Save) to save changes

#### Task Status Meanings

- **Not Started** - Task hasn't been started yet
- **In Progress** - Currently working on the task
- **Completed** - Task is finished
- **Blocked** - Task is blocked by dependencies or issues

### Reporting Issues

#### When to Report an Issue

Report an issue when you encounter:
- Equipment problems (printer, computer, etc.)
- Software issues
- Facility problems (AC, lights, etc.)
- Process inefficiencies
- Any problem that needs attention

#### How to Report an Issue

1. Click "Sorunlar" in the sidebar
2. Click "Yeni Sorun Bildir" (Report New Issue)
3. Fill in the form:
   - **Title** - Brief description (e.g., "Printer not working")
   - **Description** - Detailed explanation of the problem
   - **Priority** - How urgent is this?
     - Low - Can wait a few days
     - Medium - Should be fixed this week
     - High - Needs attention today
     - Critical - Urgent, blocking work
   - **Suggested Assignee** - Who do you think can fix this?
4. Click "Sorunu Bildir" (Report Issue)

#### Choosing a Suggested Assignee

Think about:
- Who has expertise in this area?
- Who has fixed similar issues before?
- Who is responsible for this equipment/area?

**Note:** The admin will review your suggestion and may assign it to someone else if needed.

#### Tracking Your Issues

1. Go to "Sorunlar" page
2. You'll see all issues you've reported
3. Issue statuses:
   - **Pending Assignment** - Waiting for admin to assign
   - **Assigned** - Assigned to someone
   - **In Progress** - Being worked on
   - **Resolved** - Fixed
   - **Closed** - Completed and verified

### Notifications

#### Types of Notifications

- **Task Assigned** - New task assigned to you
- **Task Updated** - Changes to your tasks
- **Issue Assigned** - Your reported issue was assigned
- **Issue Resolved** - Your reported issue was fixed

#### Viewing Notifications

1. Click the bell icon in the top bar
2. A dropdown shows recent notifications
3. Click a notification to view details
4. Click "Tümünü Gör" (View All) to see all notifications

#### Email Notifications

You'll receive email notifications for:
- New task assignments
- Important updates
- Daily digest (if enabled)

To manage email preferences:
1. Go to Profile
2. Click "Bildirim Ayarları" (Notification Settings)
3. Toggle email notifications on/off

### Profile Management

#### Updating Your Profile

1. Click your name in the top bar
2. Select "Profil" (Profile)
3. You can update:
   - Full name
   - Department
   - Avatar photo
   - Notification preferences
4. Click "Kaydet" (Save)

#### Changing Your Password

1. Go to Profile
2. Click "Şifre Değiştir" (Change Password)
3. Enter current password
4. Enter new password
5. Confirm new password
6. Click "Güncelle" (Update)

---

## Admin Guide

### Admin Dashboard

As an admin, you have access to additional features:

- **Admin Issues** - Review and assign pending issues
- **Analytics** - View team performance metrics
- **System Monitoring** - Monitor system health
- **All Tasks** - View all team tasks

### Managing Issues

#### Reviewing Pending Issues

1. Click "Admin Issues" in the sidebar
2. You'll see all pending issues
3. Each issue shows:
   - Title and description
   - Priority level
   - Reporter name
   - **Suggested assignee** (highlighted)
   - Date reported

#### Assigning an Issue

1. Click on a pending issue
2. The assignment modal opens
3. Review the issue details
4. You have two options:

**Option 1: Approve Suggestion**
- The suggested assignee is pre-selected
- Click "Görevi Ata" (Assign Task)

**Option 2: Reassign to Different Person**
- Select a different person from the dropdown
- Click "Görevi Ata" (Assign Task)

#### Editing Issue Before Assignment

You can edit the issue details before assigning:

1. In the assignment modal, edit:
   - Title
   - Description
   - Priority level
2. Make your changes
3. Select assignee
4. Click "Görevi Ata" (Assign Task)

**Note:** When you assign an issue, it automatically creates a task for the assignee.

#### What Happens After Assignment

1. A new task is created with category "Issue Resolution"
2. The assignee receives:
   - In-app notification
   - Email notification (if enabled)
3. The issue status changes to "Assigned"
4. The task appears in the assignee's task list

### Viewing All Tasks

1. Click "Görevler" (Tasks) in the sidebar
2. As admin, you see ALL tasks (not just yours)
3. Use filters to find specific tasks:
   - Filter by assignee
   - Filter by status
   - Filter by category
   - Filter by date range

### Analytics Dashboard

#### Accessing Analytics

1. Click "Analytics" in the sidebar
2. You'll see comprehensive metrics

#### Key Metrics

**Task Statistics:**
- Total tasks
- Completed tasks
- In progress tasks
- Overdue tasks
- Completion rate

**Issue Statistics:**
- Total issues reported
- Pending issues
- Resolved issues
- Average resolution time

**Team Performance:**
- Tasks per employee
- Completion rates by employee
- Workload distribution

#### Charts and Visualizations

**Task Completion Trend**
- Shows task completion over time
- Helps identify productivity patterns

**User Workload Distribution**
- Shows how tasks are distributed
- Helps balance workload

**Issue Priority Breakdown**
- Shows distribution of issue priorities
- Helps prioritize resources

#### Filtering Analytics

Use the filter options:
- **Date Range** - Last 7 days, 30 days, 90 days, custom
- **Department** - Filter by department
- **User** - Filter by specific user

#### Exporting Reports

1. Click "Export" button
2. Choose format:
   - **CSV** - For spreadsheet analysis
   - **PDF** - For printing/sharing
3. File downloads automatically

### System Monitoring

#### Accessing System Monitoring

1. Click "System Monitoring" in the sidebar
2. View real-time system health

#### Monitoring Metrics

**System Health:**
- API response time
- Database performance
- Active users
- Error rate

**Real-time Activity:**
- Recent logins
- Recent task updates
- Recent issue reports

**Alerts:**
- Performance issues
- Error spikes
- System warnings

### User Management

#### Viewing Users

1. Go to Admin Dashboard
2. Click "Kullanıcılar" (Users)
3. See list of all users

#### User Roles

**Admin:**
- Full system access
- Can assign issues
- Can view all data
- Can access analytics

**Employee:**
- Can view own tasks
- Can report issues
- Can update own tasks
- Limited to personal data

---

## Mobile App Usage

### Installing the Mobile App

#### iOS (iPhone/iPad)

1. Open Safari browser
2. Navigate to the system URL
3. Tap the "Share" button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Tap "Add"
6. The app icon appears on your home screen

#### Android

1. Open Chrome browser
2. Navigate to the system URL
3. Tap the menu (three dots)
4. Tap "Add to Home Screen"
5. Tap "Add"
6. The app icon appears on your home screen

### Mobile Features

**Touch Gestures:**
- **Swipe left** on task card - Quick actions
- **Swipe right** on task card - Mark complete
- **Pull down** - Refresh data
- **Long press** - Additional options

**Mobile Navigation:**
- Bottom navigation bar for quick access
- Hamburger menu for full navigation
- Optimized for one-handed use

**Offline Mode:**
- View cached data when offline
- Changes sync when back online
- Offline indicator shows connection status

### Push Notifications

#### Enabling Push Notifications

1. When prompted, tap "Allow"
2. Or go to device Settings > Notifications
3. Find the app and enable notifications

#### Notification Types

- Task assignments
- Issue updates
- Important announcements
- Daily digest

---

## Troubleshooting

### Common Issues

#### Cannot Login

**Problem:** Login fails with error message

**Solutions:**
1. Check your email and password are correct
2. Ensure Caps Lock is off
3. Try resetting your password
4. Clear browser cache and cookies
5. Try a different browser
6. Contact your administrator

#### Tasks Not Loading

**Problem:** Task list is empty or not loading

**Solutions:**
1. Refresh the page (F5 or pull down on mobile)
2. Check your internet connection
3. Clear browser cache
4. Try logging out and back in
5. Check if filters are applied

#### Real-time Updates Not Working

**Problem:** Changes don't appear immediately

**Solutions:**
1. Check internet connection
2. Refresh the page
3. Check browser console for errors
4. Try a different browser
5. Contact administrator if issue persists

#### Cannot Upload Files

**Problem:** File upload fails

**Solutions:**
1. Check file size (max 10MB)
2. Check file type is allowed
3. Check internet connection
4. Try a smaller file
5. Try a different browser

#### Mobile App Not Installing

**Problem:** Cannot add to home screen

**Solutions:**
1. Ensure using Safari (iOS) or Chrome (Android)
2. Check device storage space
3. Update browser to latest version
4. Try clearing browser cache
5. Restart device

### Performance Issues

#### Slow Loading

**Solutions:**
1. Check internet speed
2. Close unnecessary browser tabs
3. Clear browser cache
4. Disable browser extensions
5. Try a different browser

#### App Crashes

**Solutions:**
1. Clear browser cache
2. Update browser
3. Restart device
4. Reinstall mobile app
5. Contact administrator

### Getting Help

**Contact Support:**
- Email: support@your-company.com
- Phone: +90 XXX XXX XX XX
- In-app: Click "Help" in user menu

**Before Contacting Support:**
1. Note the exact error message
2. Note what you were doing when error occurred
3. Take a screenshot if possible
4. Note your browser and device type

---

## FAQ

### General Questions

**Q: Can I access the system from home?**
A: Yes, the system is accessible from any device with internet connection.

**Q: Is my data secure?**
A: Yes, all data is encrypted and stored securely. Only authorized users can access your information.

**Q: Can I use the system offline?**
A: The mobile app has limited offline functionality. You can view cached data, but need internet to sync changes.

**Q: How do I change my email address?**
A: Contact your administrator to change your email address.

### Task Management

**Q: Can I assign tasks to others?**
A: Only admins can assign tasks. Employees can only update their own tasks.

**Q: What happens if I miss a deadline?**
A: The task will be marked as overdue. Your manager will be notified.

**Q: Can I delete a task?**
A: No, only admins can delete tasks. You can mark tasks as completed.

**Q: How do I add attachments to tasks?**
A: Click on a task, then click "Add Attachment" button. Select your file and upload.

### Issue Reporting

**Q: What if I don't know who should fix the issue?**
A: Make your best guess. The admin will review and reassign if needed.

**Q: Can I report anonymous issues?**
A: No, all issues are tracked with reporter information for accountability.

**Q: How long does it take to resolve an issue?**
A: It depends on priority and complexity. High priority issues are typically addressed within 24 hours.

**Q: Can I cancel an issue I reported?**
A: Contact your administrator to cancel an issue.

### Notifications

**Q: How do I stop email notifications?**
A: Go to Profile > Notification Settings and toggle off email notifications.

**Q: Why am I not receiving notifications?**
A: Check your notification settings in Profile. Also check your email spam folder.

**Q: Can I customize which notifications I receive?**
A: Yes, go to Profile > Notification Settings to customize.

### Mobile App

**Q: Do I need to download anything?**
A: No, it's a web app. Just add to home screen from your browser.

**Q: Does the mobile app work offline?**
A: Limited functionality. You can view cached data but need internet to sync.

**Q: Why is the mobile app slow?**
A: Check your internet connection. Also try clearing app cache.

**Q: How do I update the mobile app?**
A: The app updates automatically. Just refresh the page.

---

## Keyboard Shortcuts

### General
- `Ctrl/Cmd + K` - Quick search
- `Ctrl/Cmd + /` - Show shortcuts
- `Esc` - Close modal/dialog

### Navigation
- `G then D` - Go to Dashboard
- `G then T` - Go to Tasks
- `G then I` - Go to Issues
- `G then P` - Go to Profile

### Actions
- `N` - New task/issue (context dependent)
- `R` - Refresh current page
- `?` - Show help

---

## Tips and Best Practices

### For Employees

1. **Update tasks regularly** - Keep your task status current
2. **Be specific in issue reports** - Provide detailed descriptions
3. **Suggest the right person** - Think carefully about who can help
4. **Check notifications daily** - Stay informed about updates
5. **Use filters** - Find tasks quickly with filters

### For Admins

1. **Review issues promptly** - Don't let issues pile up
2. **Consider suggestions** - Employees often know who can help
3. **Balance workload** - Monitor team workload in analytics
4. **Use analytics** - Make data-driven decisions
5. **Communicate clearly** - Edit issue details for clarity

### General Tips

1. **Use descriptive titles** - Make tasks/issues easy to identify
2. **Add details** - More information helps resolve issues faster
3. **Set realistic deadlines** - Don't overcommit
4. **Communicate** - Use notes to keep everyone informed
5. **Stay organized** - Use categories and priorities effectively

---

## Glossary

**Task** - A work item assigned to a user
**Issue** - A problem or concern reported by a user
**Suggested Assignee** - Person recommended to handle an issue
**Priority** - Urgency level (Low, Medium, High, Critical)
**Status** - Current state of a task or issue
**Category** - Type of task (Routine, Project, One-time, Issue Resolution)
**Dashboard** - Overview page showing key information
**Analytics** - Performance metrics and statistics
**Real-time** - Updates that appear immediately
**PWA** - Progressive Web App (mobile-friendly web application)

---

## Version History

**Version 1.0** - Initial release
- Task management
- Issue reporting
- Real-time updates
- Mobile support
- Analytics dashboard

---

## Contact Information

**Technical Support:**
- Email: support@your-company.com
- Phone: +90 XXX XXX XX XX

**System Administrator:**
- Email: admin@your-company.com

**Emergency Contact:**
- Phone: +90 XXX XXX XX XX (24/7)

---

*Last Updated: January 2026*
*Document Version: 1.0*
