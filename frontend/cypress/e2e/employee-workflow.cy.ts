/**
 * End-to-End Test: Employee Workflow
 * Tests complete employee user journey including:
 * - Login
 * - Viewing tasks
 * - Creating issues
 * - Updating task status
 * Requirements: 9.1, 12.5
 */

describe('Employee Workflow', () => {
  const employeeEmail = 'employee@test.com';
  const employeePassword = 'testpassword123';

  beforeEach(() => {
    // Clear any existing session
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should complete full employee workflow', () => {
    // Step 1: Login as employee
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(employeeEmail);
    cy.get('[data-testid="password-input"]').type(employeePassword);
    cy.get('[data-testid="login-button"]').click();

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');

    // Step 2: View tasks
    cy.visit('/tasks');
    cy.contains('Görevlerim').should('be.visible');
    
    // Verify task list loads
    cy.get('[data-testid="task-list"]', { timeout: 10000 }).should('be.visible');

    // Step 3: Filter tasks
    cy.get('[data-testid="filter-status"]').select('in_progress');
    cy.wait(500);
    
    // Step 4: Update task status (if tasks exist)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="task-card"]').length > 0) {
        cy.get('[data-testid="task-card"]').first().click();
        cy.get('[data-testid="task-status-select"]').select('completed');
        cy.get('[data-testid="save-task-button"]').click();
        cy.contains('Görev güncellendi').should('be.visible');
      }
    });

    // Step 5: Create new issue
    cy.visit('/issues');
    cy.get('[data-testid="create-issue-button"]').click();
    
    cy.get('[data-testid="issue-title"]').type('Test Issue - Network Problem');
    cy.get('[data-testid="issue-description"]').type('Cannot access shared network drive');
    cy.get('[data-testid="issue-priority"]').select('high');
    cy.get('[data-testid="suggested-assignee"]').select(1); // Select first available employee
    cy.get('[data-testid="submit-issue-button"]').click();

    // Verify issue created
    cy.contains('Sorun başarıyla bildirildi', { timeout: 5000 }).should('be.visible');

    // Step 6: View profile
    cy.visit('/profile');
    cy.contains('Profil').should('be.visible');
    cy.get('[data-testid="user-email"]').should('contain', employeeEmail);

    // Step 7: Logout
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('include', '/login');
  });

  it('should handle mobile viewport', () => {
    // Test mobile responsiveness
    cy.viewport('iphone-x');
    
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    
    // Verify mobile navigation
    cy.viewport(375, 667);
    cy.get('[data-testid="email-input"]').type(employeeEmail);
    cy.get('[data-testid="password-input"]').type(employeePassword);
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/dashboard');
  });

  it('should handle offline scenario', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(employeeEmail);
    cy.get('[data-testid="password-input"]').type(employeePassword);
    cy.get('[data-testid="login-button"]').click();
    
    cy.url().should('include', '/dashboard');
    
    // Simulate offline
    cy.window().then((win) => {
      cy.stub(win.navigator, 'onLine').value(false);
      win.dispatchEvent(new Event('offline'));
    });
    
    // Verify offline indicator appears
    cy.get('[data-testid="offline-indicator"]', { timeout: 5000 }).should('be.visible');
  });
});
