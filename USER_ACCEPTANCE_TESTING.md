# User Acceptance Testing (UAT) Guide

## Overview

This document provides comprehensive User Acceptance Testing scenarios for the Modern Office System. UAT ensures that the system meets business requirements and is ready for production use.

**Requirements Validated:** 4.1, 5.1, 6.1

## Test Environment Setup

### Prerequisites
- Access to staging environment
- Test user accounts (admin and employee roles)
- Sample data loaded
- All browsers installed for testing

### Test Accounts

```
Admin Account:
Email: admin@test.com
Password: [Provided separately]

Employee Account 1:
Email: employee1@test.com
Password: [Provided separately]

Employee Account 2:
Email: employee2@test.com
Password: [Provided separately]
```

## UAT Test Scenarios

### Scenario 1: Admin Workflow Testing

**Objective:** Verify that admin users can manage the complete issue assignment workflow.

**Requirements:** 5.1, 6.1

#### Test Steps:

1. **Login as Admin**
   - [ ] Navigate to login page
   - [ ] Enter admin credentials
   - [ ] Click "Giriş Yap"
   - **Expected:** Redirect to admin dashboard
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

2. **View Pending Issues**
   - [ ] Navigate to "Admin Issues" section
   - [ ] Verify pending issues are displayed
   - [ ] Check that suggested assignee is shown for each issue
   - **Expected:** List of pending issues with suggested assignees visible
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

3. **Review Issue Details**
   - [ ] Click on a pending issue
   - [ ] Verify issue details modal opens
   - [ ] Check that title, description, priority, and suggested assignee are displayed
   - **Expected:** Complete issue information visible in modal
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

4. **Approve Suggested Assignee**
   - [ ] In the assignment modal, verify suggested assignee is pre-selected
   - [ ] Click "Görevi Ata" button
   - [ ] Verify success message appears
   - **Expected:** Issue assigned successfully, success notification shown
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

5. **Reassign to Different Person**
   - [ ] Open another pending issue
   - [ ] Change assignee dropdown to different person
   - [ ] Click "Görevi Ata"
   - [ ] Verify success message
   - **Expected:** Issue assigned to selected person, not suggested assignee
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

6. **Edit Issue Before Assignment**
   - [ ] Open a pending issue
   - [ ] Edit the issue title
   - [ ] Edit the issue description
   - [ ] Change priority level
   - [ ] Assign the issue
   - **Expected:** Edited details saved and reflected in created task
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

7. **View Assigned Issues**
   - [ ] Filter issues by "Assigned" status
   - [ ] Verify previously assigned issues appear
   - [ ] Check that assignee names are displayed
   - **Expected:** All assigned issues visible with assignee information
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

8. **View Analytics Dashboard**
   - [ ] Navigate to Analytics page
   - [ ] Verify charts load correctly
   - [ ] Check task completion trends
   - [ ] Check user workload distribution
   - [ ] Check issue priority breakdown
   - **Expected:** All charts display with accurate data
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

9. **Export Reports**
   - [ ] Click export menu
   - [ ] Export data as CSV
   - [ ] Export data as PDF
   - [ ] Verify files download correctly
   - **Expected:** Both CSV and PDF files download with correct data
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

10. **Logout**
    - [ ] Click logout button
    - [ ] Verify redirect to login page
    - **Expected:** Successfully logged out, redirected to login
    - **Actual:** _______________
    - **Status:** ☐ Pass ☐ Fail

---

### Scenario 2: Employee Workflow Testing

**Objective:** Verify that employee users can create issues and manage their tasks.

**Requirements:** 4.1, 6.1

#### Test Steps:

1. **Login as Employee**
   - [ ] Navigate to login page
   - [ ] Enter employee credentials
   - [ ] Click "Giriş Yap"
   - **Expected:** Redirect to employee dashboard
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

2. **View Dashboard**
   - [ ] Verify dashboard displays personal statistics
   - [ ] Check assigned tasks count
   - [ ] Check pending issues count
   - [ ] Verify recent activity feed
   - **Expected:** Dashboard shows accurate personal metrics
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

3. **View Tasks**
   - [ ] Navigate to "Görevlerim" (My Tasks)
   - [ ] Verify task list displays
   - [ ] Check that only assigned tasks are visible
   - **Expected:** List of tasks assigned to logged-in employee
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

4. **Filter Tasks**
   - [ ] Use status filter (Not Started, In Progress, Completed)
   - [ ] Use category filter
   - [ ] Use priority filter
   - [ ] Verify filtered results are correct
   - **Expected:** Tasks filtered correctly based on selected criteria
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

5. **Update Task Status**
   - [ ] Click on a task
   - [ ] Change status from "Not Started" to "In Progress"
   - [ ] Update progress percentage
   - [ ] Add time spent
   - [ ] Click save
   - **Expected:** Task updated successfully, changes reflected immediately
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

6. **Complete a Task**
   - [ ] Open a task in progress
   - [ ] Change status to "Completed"
   - [ ] Set progress to 100%
   - [ ] Add completion notes
   - [ ] Click save
   - **Expected:** Task marked as completed, removed from active tasks
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

7. **Create New Issue**
   - [ ] Navigate to "Sorunlar" (Issues)
   - [ ] Click "Yeni Sorun Bildir" (Report New Issue)
   - [ ] Enter issue title
   - [ ] Enter detailed description
   - [ ] Select priority level
   - [ ] Select suggested assignee from dropdown
   - [ ] Click "Sorunu Bildir"
   - **Expected:** Issue created successfully, confirmation message shown
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

8. **View Created Issues**
   - [ ] Stay on Issues page
   - [ ] Verify newly created issue appears in list
   - [ ] Check issue status is "Pending Assignment"
   - [ ] Verify suggested assignee is displayed
   - **Expected:** Created issue visible with correct details
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

9. **Receive Task Assignment Notification**
   - [ ] Wait for admin to assign an issue (or have admin assign during test)
   - [ ] Check notification bell icon
   - [ ] Click notification bell
   - [ ] Verify new task assignment notification
   - **Expected:** Notification received for new task assignment
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

10. **Update Profile**
    - [ ] Navigate to Profile page
    - [ ] Update full name
    - [ ] Update department
    - [ ] Update notification preferences
    - [ ] Click save
    - **Expected:** Profile updated successfully
    - **Actual:** _______________
    - **Status:** ☐ Pass ☐ Fail

11. **Logout**
    - [ ] Click logout button
    - [ ] Verify redirect to login page
    - **Expected:** Successfully logged out
    - **Actual:** _______________
    - **Status:** ☐ Pass ☐ Fail

---

### Scenario 3: Complete Issue Management Flow

**Objective:** Test the complete lifecycle of an issue from creation to resolution.

**Requirements:** 4.1, 5.1, 6.1

#### Test Steps:

1. **Employee Creates Issue**
   - [ ] Login as Employee 1
   - [ ] Create new issue: "Printer not working in Room 301"
   - [ ] Set priority: High
   - [ ] Suggest Employee 2 as assignee
   - [ ] Submit issue
   - **Expected:** Issue created with status "Pending Assignment"
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

2. **Admin Receives Notification**
   - [ ] Login as Admin (in different browser/incognito)
   - [ ] Check notification bell
   - [ ] Verify new issue notification appears
   - **Expected:** Real-time notification received
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

3. **Admin Reviews Issue**
   - [ ] Navigate to Admin Issues
   - [ ] Find the printer issue
   - [ ] Click to open assignment modal
   - [ ] Verify suggested assignee is Employee 2
   - **Expected:** Issue details and suggestion visible
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

4. **Admin Assigns Issue**
   - [ ] Approve suggested assignee (Employee 2)
   - [ ] Click assign button
   - [ ] Verify success message
   - **Expected:** Issue assigned, task created
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

5. **Assignee Receives Notification**
   - [ ] Login as Employee 2 (in different browser/incognito)
   - [ ] Check notification bell
   - [ ] Verify task assignment notification
   - [ ] Check email for notification (if email configured)
   - **Expected:** Notification received via app and email
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

6. **Assignee Views Task**
   - [ ] Navigate to Tasks page
   - [ ] Filter by "Issue Resolution" category
   - [ ] Find the printer task
   - [ ] Verify task details match original issue
   - **Expected:** Task visible with correct details
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

7. **Assignee Works on Task**
   - [ ] Open the printer task
   - [ ] Change status to "In Progress"
   - [ ] Update progress to 50%
   - [ ] Add notes: "Ordered replacement toner"
   - [ ] Save changes
   - **Expected:** Task updated, changes saved
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

8. **Assignee Completes Task**
   - [ ] Open the printer task again
   - [ ] Change status to "Completed"
   - [ ] Set progress to 100%
   - [ ] Add completion notes: "Replaced toner, printer working"
   - [ ] Save changes
   - **Expected:** Task marked as completed
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

9. **Original Reporter Verifies**
   - [ ] Login as Employee 1
   - [ ] Navigate to Issues page
   - [ ] Find the printer issue
   - [ ] Verify status shows "Resolved" or "Completed"
   - **Expected:** Issue status updated to reflect completion
   - **Actual:** _______________
   - **Status:** ☐ Pass ☐ Fail

10. **Admin Reviews Completion**
    - [ ] Login as Admin
    - [ ] View Analytics dashboard
    - [ ] Verify completed task appears in metrics
    - [ ] Check issue resolution time
    - **Expected:** Metrics updated with completed task
    - **Actual:** _______________
    - **Status:** ☐ Pass ☐ Fail

---

## Mobile Device Testing

### iOS Testing (iPhone)

**Device:** iPhone 11 or later, iOS 14+

1. **Responsive Layout**
   - [ ] Open app in Safari
   - [ ] Verify layout adapts to mobile screen
   - [ ] Check that all buttons are touch-friendly
   - [ ] Verify no horizontal scrolling
   - **Status:** ☐ Pass ☐ Fail

2. **PWA Installation**
   - [ ] Tap "Share" button in Safari
   - [ ] Select "Add to Home Screen"
   - [ ] Verify app icon appears on home screen
   - [ ] Launch app from home screen
   - [ ] Verify app opens in standalone mode
   - **Status:** ☐ Pass ☐ Fail

3. **Touch Gestures**
   - [ ] Test swipe gestures on cards
   - [ ] Test pull-to-refresh
   - [ ] Test tap interactions
   - **Status:** ☐ Pass ☐ Fail

4. **Push Notifications**
   - [ ] Grant notification permission
   - [ ] Receive test notification
   - [ ] Tap notification to open app
   - **Status:** ☐ Pass ☐ Fail

### Android Testing

**Device:** Android 10+ device

1. **Responsive Layout**
   - [ ] Open app in Chrome
   - [ ] Verify layout adapts correctly
   - [ ] Check touch targets
   - [ ] Verify no horizontal scrolling
   - **Status:** ☐ Pass ☐ Fail

2. **PWA Installation**
   - [ ] Tap "Add to Home Screen" prompt
   - [ ] Verify app icon appears
   - [ ] Launch from home screen
   - [ ] Verify standalone mode
   - **Status:** ☐ Pass ☐ Fail

3. **Touch Gestures**
   - [ ] Test swipe gestures
   - [ ] Test pull-to-refresh
   - [ ] Test tap interactions
   - **Status:** ☐ Pass ☐ Fail

4. **Push Notifications**
   - [ ] Grant notification permission
   - [ ] Receive test notification
   - [ ] Tap notification to open app
   - **Status:** ☐ Pass ☐ Fail

---

## Cross-Browser Testing

### Chrome (Latest Version)
- [ ] Login/Logout
- [ ] Task Management
- [ ] Issue Creation
- [ ] Admin Assignment
- [ ] Real-time Updates
- [ ] Charts and Analytics
- **Status:** ☐ Pass ☐ Fail

### Firefox (Latest Version)
- [ ] Login/Logout
- [ ] Task Management
- [ ] Issue Creation
- [ ] Admin Assignment
- [ ] Real-time Updates
- [ ] Charts and Analytics
- **Status:** ☐ Pass ☐ Fail

### Safari (Latest Version)
- [ ] Login/Logout
- [ ] Task Management
- [ ] Issue Creation
- [ ] Admin Assignment
- [ ] Real-time Updates
- [ ] Charts and Analytics
- **Status:** ☐ Pass ☐ Fail

### Edge (Latest Version)
- [ ] Login/Logout
- [ ] Task Management
- [ ] Issue Creation
- [ ] Admin Assignment
- [ ] Real-time Updates
- [ ] Charts and Analytics
- **Status:** ☐ Pass ☐ Fail

---

## Performance Testing Checklist

### Page Load Times
- [ ] Login page loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] Task list loads in < 2 seconds
- [ ] Issue list loads in < 2 seconds
- [ ] Analytics page loads in < 4 seconds
- **Status:** ☐ Pass ☐ Fail

### Real-time Performance
- [ ] Task updates appear within 1 second
- [ ] Issue notifications appear within 2 seconds
- [ ] Status changes sync immediately
- **Status:** ☐ Pass ☐ Fail

### Offline Functionality
- [ ] App loads when offline
- [ ] Cached pages accessible
- [ ] Offline indicator appears
- [ ] Data syncs when back online
- **Status:** ☐ Pass ☐ Fail

---

## Security Testing

### Authentication
- [ ] Cannot access protected routes without login
- [ ] Session expires after timeout
- [ ] Logout clears session completely
- **Status:** ☐ Pass ☐ Fail

### Authorization
- [ ] Employees cannot access admin routes
- [ ] Employees can only see their own tasks
- [ ] Employees can only edit their own profile
- [ ] Admins can access all features
- **Status:** ☐ Pass ☐ Fail

### Data Security
- [ ] Passwords are not visible in network requests
- [ ] API calls use HTTPS
- [ ] Sensitive data is not stored in localStorage
- **Status:** ☐ Pass ☐ Fail

---

## UAT Sign-Off

### Test Summary

**Total Test Cases:** _______
**Passed:** _______
**Failed:** _______
**Blocked:** _______

### Critical Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Recommendations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Sign-Off

**Tested By:** _______________
**Date:** _______________
**Signature:** _______________

**Approved By:** _______________
**Date:** _______________
**Signature:** _______________

---

## Notes

- All tests should be performed in a staging environment
- Document any deviations from expected behavior
- Take screenshots of any issues encountered
- Report critical issues immediately to development team
- Retest failed scenarios after fixes are applied
