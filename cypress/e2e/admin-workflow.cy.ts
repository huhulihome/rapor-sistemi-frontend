/**
 * End-to-End Test: Admin Workflow
 * Tests complete admin user journey including:
 * - Login as admin
 * - Reviewing pending issues
 * - Assigning issues to employees
 * - Managing tasks
 * - Viewing analytics
 * Requirements: 9.1, 12.5
 */

describe('Admin Workflow', () => {
  const adminEmail = 'admin@test.com';
  const adminPassword = 'adminpassword123';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should complete full admin workflow', () => {
    // Step 1: Login as admin
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminEmail);
    cy.get('[data-testid="password-input"]').type(adminPassword);
    cy.get('[data-testid="login-button"]').click();

    // Verify admin dashboard access
    cy.url().should('include', '/dashboard');
    cy.contains('Admin Dashboard').should('be.visible');

    // Step 2: View pending issues
    cy.visit('/admin/issues');
    cy.contains('Bekleyen Sorunlar').should('be.visible');
    
    // Step 3: Assign issue to employee (if pending issues exist)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="pending-issue-card"]').length > 0) {
        // Click on first pending issue
        cy.get('[data-testid="pending-issue-card"]').first().click();
        
        // Verify assignment modal opens
        cy.get('[data-testid="assignment-modal"]').should('be.visible');
        
        // Check suggested assignee is displayed
        cy.get('[data-testid="suggested-assignee-info"]').should('be.visible');
        
        // Approve suggestion or reassign
        cy.get('[data-testid="assignee-select"]').select(1);
        cy.get('[data-testid="confirm-assignment-button"]').click();
        
        // Verify success message
        cy.contains('Sorun başarıyla atandı', { timeout: 5000 }).should('be.visible');
      }
    });

    // Step 4: View all tasks
    cy.visit('/tasks');
    cy.get('[data-testid="task-list"]').should('be.visible');
    
    // Apply filters
    cy.get('[data-testid="filter-category"]').select('issue_resolution');
    cy.wait(500);

    // Step 5: View analytics dashboard
    cy.visit('/analytics');
    cy.contains('Analytics').should('be.visible');
    
    // Verify charts load
    cy.get('[data-testid="task-completion-chart"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="user-workload-chart"]').should('be.visible');
    cy.get('[data-testid="issue-priority-chart"]').should('be.visible');

    // Step 6: Export data
    cy.get('[data-testid="export-menu-button"]').click();
    cy.get('[data-testid="export-csv"]').should('be.visible');
    cy.get('[data-testid="export-pdf"]').should('be.visible');

    // Step 7: View system monitoring
    cy.visit('/monitoring');
    cy.contains('System Monitoring').should('be.visible');
    cy.get('[data-testid="system-health"]').should('be.visible');

    // Step 8: Logout
    cy.get('[data-testid="logout-button"]').click();
    cy.url().should('include', '/login');
  });

  it('should handle real-time issue notifications', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminEmail);
    cy.get('[data-testid="password-input"]').type(adminPassword);
    cy.get('[data-testid="login-button"]').click();

    cy.url().should('include', '/dashboard');
    
    // Check notification bell
    cy.get('[data-testid="notification-bell"]').should('be.visible');
    
    // Verify notification count updates (if notifications exist)
    cy.get('[data-testid="notification-bell"]').click();
    cy.get('[data-testid="notification-dropdown"]').should('be.visible');
  });

  it('should manage user permissions', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(adminEmail);
    cy.get('[data-testid="password-input"]').type(adminPassword);
    cy.get('[data-testid="login-button"]').click();

    // Admin should see admin-only features
    cy.visit('/admin/issues');
    cy.get('[data-testid="admin-panel"]').should('be.visible');
    
    // Verify admin can access all sections
    cy.visit('/analytics');
    cy.url().should('include', '/analytics');
    
    cy.visit('/monitoring');
    cy.url().should('include', '/monitoring');
  });
});
