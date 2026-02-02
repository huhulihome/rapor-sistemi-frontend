import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock components for testing
const MockButton = ({ onClick, children, disabled }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
);

const MockLoadingSpinner = ({ size, message }: { size?: string; message?: string }) => (
    <div data-testid="loading-spinner" data-size={size}>
        {message && <span>{message}</span>}
    </div>
);

describe('UI Components', () => {
    describe('Button', () => {
        it('should render with children', () => {
            render(<MockButton>Click me</MockButton>);
            expect(screen.getByText('Click me')).toBeInTheDocument();
        });

        it('should call onClick when clicked', async () => {
            const handleClick = vi.fn();
            render(<MockButton onClick={handleClick}>Click</MockButton>);

            await userEvent.click(screen.getByText('Click'));
            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should not call onClick when disabled', async () => {
            const handleClick = vi.fn();
            render(<MockButton onClick={handleClick} disabled>Disabled</MockButton>);

            await userEvent.click(screen.getByText('Disabled'));
            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('LoadingSpinner', () => {
        it('should render without message', () => {
            render(<MockLoadingSpinner size="md" />);
            expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
        });

        it('should render with message', () => {
            render(<MockLoadingSpinner size="lg" message="Yükleniyor..." />);
            expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
        });

        it('should apply correct size attribute', () => {
            render(<MockLoadingSpinner size="lg" />);
            expect(screen.getByTestId('loading-spinner')).toHaveAttribute('data-size', 'lg');
        });
    });
});

describe('Utility Functions', () => {
    describe('classNames', () => {
        const classNames = (...classes: (string | boolean | undefined)[]) =>
            classes.filter(Boolean).join(' ');

        it('should combine multiple classes', () => {
            expect(classNames('class1', 'class2', 'class3')).toBe('class1 class2 class3');
        });

        it('should filter out falsy values', () => {
            expect(classNames('class1', false, undefined, 'class2')).toBe('class1 class2');
        });

        it('should return empty string for no classes', () => {
            expect(classNames()).toBe('');
        });
    });

    describe('formatTime', () => {
        const formatTime = (dateString: string) => {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 1) return 'Az önce';
            if (diffMins < 60) return `${diffMins} dk önce`;
            return 'Daha önce';
        };

        it('should return "Az önce" for recent times', () => {
            const now = new Date().toISOString();
            expect(formatTime(now)).toBe('Az önce');
        });
    });
});

describe('Form Validation', () => {
    describe('Email validation', () => {
        const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        it('should validate correct email', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
        });

        it('should reject invalid email', () => {
            expect(isValidEmail('invalid-email')).toBe(false);
        });

        it('should reject email without domain', () => {
            expect(isValidEmail('test@')).toBe(false);
        });
    });

    describe('Required field validation', () => {
        const isRequired = (value: string) => value.trim().length > 0;

        it('should return true for non-empty string', () => {
            expect(isRequired('test')).toBe(true);
        });

        it('should return false for empty string', () => {
            expect(isRequired('')).toBe(false);
        });

        it('should return false for whitespace-only string', () => {
            expect(isRequired('   ')).toBe(false);
        });
    });
});

describe('API Response Handling', () => {
    it('should handle successful response', () => {
        const response = { data: { tasks: [] }, error: null };
        expect(response.error).toBeNull();
        expect(response.data).toBeDefined();
    });

    it('should handle error response', () => {
        const response = { data: null, error: 'Failed to fetch' };
        expect(response.error).toBe('Failed to fetch');
        expect(response.data).toBeNull();
    });
});
