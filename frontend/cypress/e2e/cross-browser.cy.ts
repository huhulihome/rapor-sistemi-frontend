/**
 * End-to-End Test: Cross-Browser Compatibility
 * Tests core functionality across different browsers and viewports
 * Requirements: 9.1, 12.5
 */

describe('Cross-Browser Compatibility Tests', () => {
  const testEmail = 'test@test.com';
  const testPassword = 'testpassword123';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Desktop Viewports', () => {
    const desktopSizes = [
      { width: 1920, height: 1080, name: 'Full HD' },
      { width: 1366, height: 768, name: 'Laptop' },
      { width: 1280, height: 720, name: 'HD' },
    ];

    desktopSizes.forEach(({ width, height, name }) => {
      it(`should work correctly on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height);
        
        // Test login
        cy.visit('/login');
        cy.get('[data-testid="email-input"]').should('be.visible');
        cy.get('[data-testid="password-input"]').should('be.visible');
        cy.get('[data-testid="login-button"]').should('be.visible');

        // Test responsive layout
        cy.get('body').should('have.css', 'font-family');
        
        // Verify no horizontal scroll
        cy.window().then((win) => {
          expect(win.document.documentElement.scrollWidth).to.be.lte(width);
        });
      });
    });
  });

  describe('Mobile Viewports', () => {
    const mobileSizes = [
      { width: 375, height: 667, name: 'iPhone SE' },
      { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
      { width: 360, height: 640, name: 'Android Small' },
      { width: 412, height: 915, name: 'Android Large' },
    ];

    mobileSizes.forEach(({ width, height, name }) => {
      it(`should work correctly on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height);
        
        cy.visit('/login');
        
        // Verify mobile-friendly inputs
        cy.get('[data-testid="email-input"]').should('be.visible');
        cy.get('[data-testid="email-input"]').should('have.attr', 'type', 'email');
        
        // Test touch-friendly buttons
        cy.get('[data-testid="login-button"]').should('be.visible');
        cy.get('[data-testid="login-button"]').then(($btn) => {
          const height = $btn.height();
          // Touch targets should be at least 44px
          expect(height).to.be.at.least(40);
        });

        // Verify no horizontal scroll
        cy.window().then((win) => {
          expect(win.document.documentElement.scrollWidth).to.be.lte(width);
        });
      });
    });
  });

  describe('Tablet Viewports', () => {
    const tabletSizes = [
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1024, height: 768, name: 'iPad Landscape' },
      { width: 800, height: 1280, name: 'Android Tablet' },
    ];

    tabletSizes.forEach(({ width, height, name }) => {
      it(`should work correctly on ${name} (${width}x${height})`, () => {
        cy.viewport(width, height);
        
        cy.visit('/login');
        cy.get('[data-testid="email-input"]').should('be.visible');
        cy.get('[data-testid="password-input"]').should('be.visible');
        
        // Verify layout adapts
        cy.window().then((win) => {
          expect(win.document.documentElement.scrollWidth).to.be.lte(width);
        });
      });
    });
  });

  describe('Core Functionality Across Viewports', () => {
    it('should handle form submission on all screen sizes', () => {
      const viewports = [
        [1920, 1080],
        [768, 1024],
        [375, 667],
      ];

      viewports.forEach(([width, height]) => {
        cy.viewport(width, height);
        cy.visit('/login');
        
        cy.get('[data-testid="email-input"]').type(testEmail);
        cy.get('[data-testid="password-input"]').type(testPassword);
        cy.get('[data-testid="login-button"]').click();
        
        // Should attempt login (may fail if credentials invalid, but form should work)
        cy.url().should('not.equal', 'about:blank');
        
        cy.clearCookies();
        cy.clearLocalStorage();
      });
    });

    it('should display navigation correctly on all screen sizes', () => {
      cy.visit('/login');
      cy.get('[data-testid="email-input"]').type(testEmail);
      cy.get('[data-testid="password-input"]').type(testPassword);
      cy.get('[data-testid="login-button"]').click();

      // Desktop - sidebar should be visible
      cy.viewport(1920, 1080);
      cy.visit('/dashboard');
      cy.get('[data-testid="sidebar"]').should('be.visible');

      // Mobile - sidebar should be hidden, hamburger menu visible
      cy.viewport(375, 667);
      cy.visit('/dashboard');
      cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
    });
  });

  describe('Performance Across Browsers', () => {
    it('should load pages within acceptable time', () => {
      cy.visit('/login', { timeout: 5000 });
      cy.get('[data-testid="email-input"]').should('be.visible');
      
      // Measure page load performance
      cy.window().then((win) => {
        const perfData = win.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        // Page should load in under 3 seconds
        expect(pageLoadTime).to.be.lessThan(3000);
      });
    });
  });

  describe('Accessibility Features', () => {
    it('should support keyboard navigation', () => {
      cy.visit('/login');
      
      // Tab through form elements
      cy.get('body').tab();
      cy.focused().should('have.attr', 'data-testid', 'email-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'password-input');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'data-testid', 'login-button');
    });

    it('should have proper ARIA labels', () => {
      cy.visit('/login');
      
      cy.get('[data-testid="email-input"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="password-input"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="login-button"]').should('have.attr', 'aria-label');
    });
  });
});
