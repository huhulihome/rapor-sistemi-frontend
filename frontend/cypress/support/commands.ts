/// <reference types="cypress" />

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });
});

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Custom command for creating a test issue
Cypress.Commands.add('createIssue', (title: string, description: string, priority: string) => {
  cy.visit('/issues');
  cy.get('[data-testid="create-issue-button"]').click();
  cy.get('[data-testid="issue-title"]').type(title);
  cy.get('[data-testid="issue-description"]').type(description);
  cy.get('[data-testid="issue-priority"]').select(priority);
  cy.get('[data-testid="suggested-assignee"]').select(1);
  cy.get('[data-testid="submit-issue-button"]').click();
});

// Custom command for tab navigation
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  if (subject) {
    cy.wrap(subject).trigger('keydown', { keyCode: 9, which: 9 });
  } else {
    cy.focused().trigger('keydown', { keyCode: 9, which: 9 });
  }
  return cy.focused();
});

// Extend Cypress namespace for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      createIssue(title: string, description: string, priority: string): Chainable<void>;
      tab(options?: Partial<TypeOptions>): Chainable<JQuery<HTMLElement>>;
    }
  }
}

export {};
