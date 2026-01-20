# Modern Office System - Testing Guide

## Overview

This project implements a comprehensive testing strategy using modern testing tools:

- **Frontend**: Vitest + React Testing Library + Cypress
- **Backend**: Vitest + Supertest

## Quick Start

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run Cypress E2E tests (interactive)
npx cypress open

# Run Cypress E2E tests (headless)
npx cypress run
```

### Backend Tests

```bash
cd backend

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Testing Strategy

### 1. Unit Tests

**Purpose**: Test individual components and functions in isolation

**Tools**: Vitest + React Testing Library (frontend), Vitest (backend)

**What to test**:
- Component rendering
- User interactions
- Business logic
- Utility functions
- API endpoints
- Service layer functions

**Example**:
```typescript
// Frontend component test
it('should display task title', () => {
  render(<TaskCard task={mockTask} />);
  expect(screen.getByText('Test Task')).toBeInTheDocument();
});

// Backend service test
it('should create a task', async () => {
  const task = await createTask({ title: 'Test' });
  expect(task).toHaveProperty('id');
});
```

### 2. Integration Tests

**Purpose**: Test how multiple components/modules work together

**Tools**: Vitest + React Testing Library (frontend), Vitest + Supertest (backend)

**What to test**:
- Component interactions
- API request/response flows
- Database operations
- Authentication flows

**Example**:
```typescript
// Frontend integration test
it('should submit issue form', async () => {
  render(<IssueForm />);
  await userEvent.type(screen.getByLabelText('Title'), 'Bug Report');
  await userEvent.click(screen.getByText('Submit'));
  expect(mockApiCall).toHaveBeenCalled();
});

// Backend integration test
it('should create and retrieve task', async () => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title: 'Test' });
  
  const getResponse = await request(app)
    .get(`/api/tasks/${response.body.id}`);
  
  expect(getResponse.body.title).toBe('Test');
});
```

### 3. End-to-End Tests

**Purpose**: Test complete user workflows from start to finish

**Tools**: Cypress

**What to test**:
- Critical user journeys
- Login/authentication flow
- Task creation and management
- Issue reporting and assignment
- Real-time updates

**Example**:
```typescript
it('should complete issue workflow', () => {
  cy.login('employee@example.com', 'password');
  cy.visit('/issues');
  cy.get('[data-testid=create-issue]').click();
  cy.get('[data-testid=issue-title]').type('Network Issue');
  cy.get('[data-testid=suggested-assignee]').select('IT Support');
  cy.get('[data-testid=submit-issue]').click();
  cy.contains('Issue created successfully').should('be.visible');
});
```

## Test Organization

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── TaskCard.tsx
│   │   └── TaskCard.test.tsx       # Unit test
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   └── Dashboard.test.tsx      # Integration test
│   └── test/
│       └── setup.ts                # Test configuration
├── cypress/
│   ├── e2e/
│   │   ├── login.cy.ts             # E2E test
│   │   └── issues.cy.ts            # E2E test
│   └── support/
│       └── commands.ts             # Custom commands
└── vitest.config.ts
```

### Backend Structure

```
backend/
├── src/
│   ├── routes/
│   │   ├── tasks.ts
│   │   └── tasks.test.ts           # Route tests
│   ├── services/
│   │   ├── email.ts
│   │   └── email.test.ts           # Service tests
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── auth.test.ts            # Middleware tests
│   └── test/
│       └── setup.ts                # Test configuration
└── vitest.config.ts
```

## Testing Checklist

### Before Committing

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Code coverage meets minimum threshold (80%)
- [ ] No console errors or warnings
- [ ] Tests are properly organized and named

### Before Deploying

- [ ] All E2E tests pass
- [ ] Tests run successfully in CI/CD pipeline
- [ ] Performance tests pass
- [ ] Security tests pass
- [ ] Database migrations tested

## Common Testing Patterns

### 1. Testing Async Operations

```typescript
it('should load tasks', async () => {
  render(<TaskList />);
  
  // Wait for async operation
  await waitFor(() => {
    expect(screen.getByText('Task 1')).toBeInTheDocument();
  });
});
```

### 2. Testing User Interactions

```typescript
it('should toggle task status', async () => {
  const user = userEvent.setup();
  render(<TaskCard task={mockTask} />);
  
  await user.click(screen.getByRole('checkbox'));
  
  expect(mockUpdateTask).toHaveBeenCalledWith({
    ...mockTask,
    status: 'completed'
  });
});
```

### 3. Testing API Calls

```typescript
it('should handle API errors', async () => {
  vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
  
  render(<TaskList />);
  
  await waitFor(() => {
    expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
  });
});
```

### 4. Testing Real-time Updates

```typescript
it('should update on real-time event', async () => {
  render(<TaskList />);
  
  // Simulate Supabase real-time event
  act(() => {
    mockRealtimeChannel.trigger('INSERT', {
      new: { id: '1', title: 'New Task' }
    });
  });
  
  await waitFor(() => {
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });
});
```

## Mocking Strategies

### 1. Mock Supabase

```typescript
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    })),
    auth: {
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  }),
}));
```

### 2. Mock React Router

```typescript
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '123' }),
}));
```

### 3. Mock Environment Variables

```typescript
beforeEach(() => {
  process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'test-key';
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm ci
      - run: cd frontend && npm test
      - run: cd frontend && npx cypress run

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm ci
      - run: cd backend && npm test
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in config
   - Check for unresolved promises
   - Verify async operations complete

2. **Flaky tests**
   - Add proper wait conditions
   - Avoid hardcoded delays
   - Use `waitFor` instead of `setTimeout`

3. **Mock not working**
   - Ensure mock is defined before import
   - Check mock path matches actual import
   - Clear mocks between tests

4. **Cypress installation fails**
   - Clear npm cache: `npm cache clean --force`
   - Install separately: `npm install cypress`
   - Verify installation: `npx cypress verify`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Requirements Coverage

This testing setup validates:

- **Requirement 12.1**: Comprehensive testing infrastructure
- **Requirement 12.2**: API and backend testing
- **Requirement 12.3**: Frontend component testing
- **Requirement 12.4**: Performance testing capabilities
- **Requirement 12.5**: Cross-browser and device testing
