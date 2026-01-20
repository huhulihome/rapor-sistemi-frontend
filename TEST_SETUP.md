# Test Setup Documentation

## Overview

This project uses **Vitest** for unit and integration testing, and **Cypress** for end-to-end testing.

## Unit & Integration Testing (Vitest + React Testing Library)

### Configuration

- **Config File**: `vitest.config.ts`
- **Setup File**: `src/test/setup.ts`
- **Test Pattern**: `**/*.test.{ts,tsx}`

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Writing Tests

Example test file (`Component.test.tsx`):

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Available Testing Libraries

- `vitest` - Test runner
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom matchers for DOM elements
- `@testing-library/user-event` - User interaction simulation

## End-to-End Testing (Cypress)

### Configuration

- **Config File**: `cypress.config.ts`
- **E2E Tests**: `cypress/e2e/**/*.cy.{ts,tsx}`
- **Component Tests**: `src/**/*.cy.{ts,tsx}`
- **Support Files**: `cypress/support/`

### Running Cypress Tests

```bash
# Open Cypress Test Runner (interactive)
npx cypress open

# Run Cypress tests headlessly
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/example.cy.ts"
```

### Writing E2E Tests

Example E2E test (`cypress/e2e/login.cy.ts`):

```typescript
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully', () => {
    cy.get('[data-testid=email-input]').type('user@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### Custom Commands

Custom Cypress commands are defined in `cypress/support/commands.ts`:

```typescript
// Usage in tests
cy.login('user@example.com', 'password123');
```

## Test Structure

```
frontend/
├── src/
│   ├── test/
│   │   └── setup.ts           # Vitest setup
│   ├── **/*.test.tsx          # Unit/integration tests
│   └── **/*.cy.tsx            # Component tests (Cypress)
├── cypress/
│   ├── e2e/
│   │   └── **/*.cy.ts         # E2E tests
│   ├── support/
│   │   ├── commands.ts        # Custom commands
│   │   ├── e2e.ts             # E2E support file
│   │   └── component.ts       # Component support file
│   └── fixtures/              # Test data
├── vitest.config.ts           # Vitest configuration
└── cypress.config.ts          # Cypress configuration
```

## Best Practices

### Unit Tests

1. **Test behavior, not implementation**
2. **Use data-testid attributes** for reliable element selection
3. **Mock external dependencies** (API calls, Supabase, etc.)
4. **Keep tests focused** - one concept per test
5. **Use descriptive test names**

### E2E Tests

1. **Test critical user flows** (login, task creation, issue reporting)
2. **Use custom commands** for repeated actions
3. **Avoid testing implementation details**
4. **Use fixtures** for test data
5. **Clean up after tests** (reset database state if needed)

## Coverage

To generate test coverage reports:

```bash
# Run tests with coverage
npm test -- --coverage

# View coverage report
open coverage/index.html
```

## Troubleshooting

### Cypress Installation Issues

If Cypress installation fails on Windows, try:

```bash
# Clear npm cache
npm cache clean --force

# Install Cypress separately
npm install --save-dev cypress

# Verify Cypress installation
npx cypress verify
```

### Vitest Issues

If tests fail to run:

1. Check that `jsdom` is installed
2. Verify `vitest.config.ts` is properly configured
3. Ensure test files match the pattern `**/*.test.{ts,tsx}`

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run Unit Tests
  run: npm test

- name: Run E2E Tests
  run: npx cypress run
```

## Requirements Validation

This test setup validates:

- **Requirement 12.1**: Performance and testing infrastructure
- **Requirement 12.5**: Cross-browser and device testing capabilities
