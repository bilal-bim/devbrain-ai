import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with correct text content', () => {
      render(<Button variant="primary">Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies correct CSS classes for variants', () => {
      const { rerender } = render(<Button variant="primary">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-primary-600');

      rerender(<Button variant="secondary">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-white');
    });

    it('applies correct size classes', () => {
      const { rerender } = render(<Button size="sm">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm');

      rerender(<Button size="lg">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-base');
    });

    it('renders left and right icons', () => {
      render(
        <Button
          variant="primary"
          leftIcon={<span data-testid="left-icon">L</span>}
          rightIcon={<span data-testid="right-icon">R</span>}
        >
          Test
        </Button>
      );

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(
        <Button variant="primary" onClick={handleClick}>
          Click me
        </Button>
      );

      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button variant="primary" onClick={handleClick} disabled>
          Click me
        </Button>
      );

      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(
        <Button variant="primary" onClick={handleClick} loading>
          Click me
        </Button>
      );

      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner and disables button', () => {
      render(
        <Button variant="primary" loading>
          Submit
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('hides icons when loading', () => {
      render(
        <Button
          variant="primary"
          loading
          leftIcon={<span data-testid="left-icon">L</span>}
        >
          Submit
        </Button>
      );

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<Button variant="primary">Test</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports custom test id', () => {
      render(
        <Button variant="primary" data-testid="custom-button">
          Test
        </Button>
      );
      expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    });

    it('is focusable when not disabled', () => {
      render(<Button variant="primary">Test</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(
        <Button variant="primary" disabled>
          Test
        </Button>
      );
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Custom Props', () => {
    it('supports form attribute', () => {
      render(
        <Button variant="primary" form="test-form" type="submit">
          Submit
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('merges custom className', () => {
      render(
        <Button variant="primary" className="custom-class">
          Test
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('bg-primary-600'); // Still has variant classes
    });
  });
});