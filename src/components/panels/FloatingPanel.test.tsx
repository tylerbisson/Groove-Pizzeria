import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FloatingPanel from './FloatingPanel';

const renderPanel = (props: Partial<React.ComponentProps<typeof FloatingPanel>> = {}) =>
  render(
    <FloatingPanel label="Test panel" icon="X" {...props}>
      <button>First action</button>
      <span>Panel content</span>
    </FloatingPanel>
  );

describe('FloatingPanel', () => {
  describe('initial state', () => {
    it('renders the trigger button with the given label', () => {
      renderPanel();
      expect(screen.getByRole('button', { name: 'Test panel' })).toBeInTheDocument();
    });

    it('panel is not visible on initial render', () => {
      renderPanel();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('trigger button reports aria-expanded false initially', () => {
      renderPanel();
      expect(screen.getByRole('button', { name: 'Test panel' })).toHaveAttribute(
        'aria-expanded',
        'false'
      );
    });
  });

  describe('open / close', () => {
    it('opens the panel on trigger click', async () => {
      const user = userEvent.setup();
      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Test panel' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders children inside the panel when open', async () => {
      const user = userEvent.setup();
      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Test panel' }));
      expect(screen.getByText('Panel content')).toBeInTheDocument();
    });

    it('closes the panel on second trigger click', async () => {
      const user = userEvent.setup();
      renderPanel();
      const btn = screen.getByRole('button', { name: 'Test panel' });
      await user.click(btn);
      await user.click(btn);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes the panel on Escape', async () => {
      const user = userEvent.setup();
      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Test panel' }));
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes the panel when clicking outside', async () => {
      const user = userEvent.setup();
      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Test panel' }));
      await user.click(document.body);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('focus management', () => {
    it('moves focus to the first focusable child when opening', async () => {
      const user = userEvent.setup();
      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Test panel' }));
      expect(screen.getByRole('button', { name: 'First action' })).toHaveFocus();
    });

    it('returns focus to the trigger button after closing via Escape', async () => {
      const user = userEvent.setup();
      renderPanel();
      const trigger = screen.getByRole('button', { name: 'Test panel' });
      await user.click(trigger);
      await user.keyboard('{Escape}');
      expect(trigger).toHaveFocus();
    });
  });

  describe('aria attributes', () => {
    it('sets aria-expanded to true when open', async () => {
      const user = userEvent.setup();
      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Test panel' }));
      expect(screen.getByRole('button', { name: 'Test panel' })).toHaveAttribute(
        'aria-expanded',
        'true'
      );
    });

    it('dialog has aria-label matching the panel label', async () => {
      const user = userEvent.setup();
      renderPanel();
      await user.click(screen.getByRole('button', { name: 'Test panel' }));
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Test panel');
    });
  });
});
