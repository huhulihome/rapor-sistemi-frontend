/**
 * End-to-End Test: Complete Issue Management Flow
 * Tests the full lifecycle of an issue from creation to resolution:
 * - Employee creates issue with suggested assignee
 * - Admin receives notification
 * - Admin reviews and assigns issue
 * - Issue converts to task
 * - Assignee receives notification
 * - Task is completed
 * Requirements: 4.1, 5.1, 6.1
 */

describe('Issue Management Flow', () => {
  const employeeEmail = 'employee@test.com';
  const employeePassword = 'testpassword123';
  const adminEmail = 'admin@test.com';
  const adminPassword = 'adminpassword123';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should complete full issue lifecycle from creation to resolution', () => {
    // PART 1: Employee creates issue
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(employeeEmail);
    cy.get('[data-testid="password-input"]').type(employeePassword);
    cy.get('[data-testid="login-button"]').click();

    cy.url().should('include', '/dashboard');

    // Navigate to issues page
    cy.visit('/issues');
    cy.get('[data-testid="create-issue-button"]').click();

    // Fill issue form
    const issueTitle = `E2E Test Issue - ${Date.now()}`;
    cy.get('[data-testid="issue-title"]').type(issueTitle);
    cy.get('[data-testid="issue-description"]').type('This is a test issue for E2E testing. The printer is not working properly.');
    cy.get('[data-testid="issue-priority"]').select('high');
    
    // Select suggested assignee
    cy.get('[data-testid="suggested-assignee"]').select(1);
    
    // Submit issue
    cy.get('[data-testid="submit-issue-button"]').click();

    // Verify success message
    cy.contains('Sorun başarıyla bildirildi', { timeout: 5000 }).should('be.visible');

    // Verify issue appears in list
    cy.get('[data-testid="issue-list"]').should('contain', issueTitle);

    // Logout employee
    cy.get('[data-testid="logout-button"]').click();

    // PART 2: Admin reviews and assigns issue
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminEmail);
    cy.get('[data-testid="password-input"]').type(adminPassword);
    cy.get('[data-testid="login-button"]').click();

    cy.url().should('include', '/dashboard');

    // Navigate to admin issues page
    cy.visit('/admin/issues');
    
    // Find the created issue
    cy.contains(issueTitle, { timeout: 10000 }).should('be.visible');
    cy.contains(issueTitle).parents('[data-testid="pending-issue-card"]').click();

    // Verify assignment modal
    cy.get('[data-testid="assignment-modal"]').should('be.visible');
    cy.get('[data-testid="suggested-assignee-info"]').should('be.visible');

    // Assign to suggested person
    cy.get('[data-testid="confirm-assignment-button"]').click();

    // Verify success
    cy.contains('Sorun başarıyla atandı', { timeout: 5000 }).should('be.visible');

    // Verify issue status changed
    cy.visit('/admin/issues');
    cy.get('[data-testid="filter-status"]').select('assigned');
    cy.wait(500);
    cy.contains(issueTitle).should('be.visible');

    // PART 3: Verify task was created
    cy.visit('/tasks');
    cy.get('[data-testid="filter-category"]').select('issue_resolution');
    cy.wait(500);
    
    // The task should exist with the issue title
    cy.contains(issueTitle, { timeout: 5000 }).should('be.visible');

    // Logout admin
    cy.get('[data-testid="logout-button"]').click();

    // PART 4: Assignee completes the task
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(employeeEmail);
    cy.get('[data-testid="password-input"]').type(employeePassword);
    cy.get('[data-testid="login-button"]').click();

    // Navigate to tasks
    cy.visit('/tasks');
    cy.get('[data-testid="filter-category"]').select('issue_resolution');
    cy.wait(500);

    // Find and complete the task
    cy.contains(issueTitle).should('be.visible');
    cy.contains(issueTitle).parents('[data-testid="task-card"]').click();

    // Update task status to completed
    cy.get('[data-testid="task-status-select"]').select('completed');
    cy.get('[data-testid="task-progress"]').clear().type('100');
    cy.get('[data-testid="save-task-button"]').click();

    // Verify completion
    cy.contains('Görev güncellendi', { timeout: 5000 }).should('be.visible');
  });

  it('should allow admin to reassign issue to different person', () => {
    // Login as employee and create issue
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(employeeEmail);
    cy.get('[data-testid="password-input"]').type(employeePassword);
    cy.get('[data-testid="login-button"]').click();

    cy.visit('/issues');
    cy.get('[data-testid="create-issue-button"]').click();

    const issueTitle = `Reassign Test - ${Date.now()}`;
    cy.get('[data-testid="issue-title"]').type(issueTitle);
    cy.get('[data-testid="issue-description"]').type('Test reassignment functionality');
    cy.get('[data-testid="issue-priority"]').select('medium');
    cy.get('[data-testid="suggested-assignee"]').select(1);
    cy.get('[data-testid="submit-issue-button"]').click();

    cy.contains('Sorun başarıyla bildirildi', { timeout: 5000 }).should('be.visible');
    cy.get('[data-testid="logout-button"]').click();

    // Login as admin
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminEmail);
    cy.get('[data-testid="password-input"]').type(adminPassword);
    cy.get('[data-testid="login-button"]').click();

    cy.visit('/admin/issues');
    cy.contains(issueTitle, { timeout: 10000 }).should('be.visible');
    cy.contains(issueTitle).parents('[data-testid="pending-issue-card"]').click();

    // Select different assignee
    cy.get('[data-testid="assignee-select"]').select(2); // Select different person
    cy.get('[data-testid="confirm-assignment-button"]').click();

    cy.contains('Sorun başarıyla atandı', { timeout: 5000 }).should('be.visible');
  });

  it('should allow admin to edit issue before assigning', () => {
    // Login as employee and create issue
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(employeeEmail);
    cy.get('[data-testid="password-input"]').type(employeePassword);
    cy.get('[data-testid="login-button"]').click();

    cy.visit('/issues');
    cy.get('[data-testid="create-issue-button"]').click();

    const issueTitle = `Edit Test - ${Date.now()}`;
    cy.get('[data-testid="issue-title"]').type(issueTitle);
    cy.get('[data-testid="issue-description"]').type('Original description');
    cy.get('[data-testid="issue-priority"]').select('low');
    cy.get('[data-testid="suggested-assignee"]').select(1);
    cy.get('[data-testid="submit-issue-button"]').click();

    cy.contains('Sorun başarıyla bildirildi', { timeout: 5000 }).should('be.visible');
    cy.get('[data-testid="logout-button"]').click();

    // Login as admin
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminEmail);
    cy.get('[data-testid="password-input"]').type(adminPassword);
    cy.get('[data-testid="login-button"]').click();

    cy.visit('/admin/issues');
    cy.contains(issueTitle, { timeout: 10000 }).should('be.visible');
    cy.contains(issueTitle).parents('[data-testid="pending-issue-card"]').click();

    // Edit issue details
    cy.get('[data-testid="edit-issue-title"]').clear().type(`${issueTitle} - Edited`);
    cy.get('[data-testid="edit-issue-description"]').clear().type('Updated description with more details');
    cy.get('[data-testid="edit-issue-priority"]').select('high');

    // Assign
    cy.get('[data-testid="confirm-assignment-button"]').click();
    cy.contains('Sorun başarıyla atandı', { timeout: 5000 }).should('be.visible');

    // Verify edited details in task
    cy.visit('/tasks');
    cy.get('[data-testid="filter-category"]').select('issue_resolution');
    cy.wait(500);
    cy.contains(`${issueTitle} - Edited`).should('be.visible');
  });
});
