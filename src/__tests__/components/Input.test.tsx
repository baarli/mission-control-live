import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Input from '@/components/UI/Input';

describe('Input', () => {
  describe('stable IDs', () => {
    it('generates a stable, non-empty id when none is provided', () => {
      const { rerender } = render(<Input label="Name" />);
      const inputEl = screen.getByRole('textbox');
      const firstId = inputEl.getAttribute('id');

      expect(firstId).toBeTruthy();

      // Re-render: id must stay the same (useId is stable across re-renders)
      rerender(<Input label="Name" />);
      expect(screen.getByRole('textbox').getAttribute('id')).toBe(firstId);
    });

    it('uses the provided id when given', () => {
      render(<Input id="custom-id" label="Name" />);
      expect(screen.getByRole('textbox').getAttribute('id')).toBe('custom-id');
    });

    it('associates label htmlFor with input id', () => {
      render(<Input label="Email" />);
      const inputEl = screen.getByRole('textbox');
      const label = screen.getByText('Email');
      expect(label.getAttribute('for')).toBe(inputEl.getAttribute('id'));
    });

    it('sets aria-describedby to the error message id when there is an error', () => {
      render(<Input label="Email" error="Required" />);
      const inputEl = screen.getByRole('textbox');
      const describedById = inputEl.getAttribute('aria-describedby');
      expect(describedById).toBeTruthy();
      const errorEl = document.getElementById(describedById!);
      expect(errorEl).toBeInTheDocument();
      expect(errorEl?.textContent).toBe('Required');
    });

    it('does not use Math.random (ids start with "input-:")', () => {
      render(<Input label="Test" />);
      const id = screen.getByRole('textbox').getAttribute('id');
      // useId IDs contain a colon; Math.random IDs do not
      expect(id).toMatch(/^input-:/);
    });

    it('two independent Input instances get different stable ids', () => {
      render(
        <div>
          <Input label="First" />
          <Input label="Second" />
        </div>
      );
      const inputs = screen.getAllByRole('textbox');
      const firstId = inputs[0]?.getAttribute('id');
      const secondId = inputs[1]?.getAttribute('id');
      expect(firstId).not.toBe(secondId);
    });
  });

  describe('error state', () => {
    it('sets aria-invalid when error is present', () => {
      render(<Input label="Field" error="Something went wrong" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-describedby when there is no error', () => {
      render(<Input label="Field" />);
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('multiline', () => {
    it('renders a textarea when multiline is true', () => {
      render(<Input label="Bio" multiline />);
      expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
    });
  });
});
