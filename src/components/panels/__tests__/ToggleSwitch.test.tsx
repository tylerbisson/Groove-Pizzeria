import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToggleSwitch from '../ToggleSwitch';

const renderSwitch = (checked: boolean, onChange = vi.fn()) =>
  render(<ToggleSwitch checked={checked} onChange={onChange} label="Test switch" fontSize={13} />);

describe('ToggleSwitch', () => {
  describe('aria state', () => {
    it('reflects checked=true via aria-checked', () => {
      renderSwitch(true);
      expect(screen.getByRole('switch', { name: 'Test switch' })).toBeChecked();
    });

    it('reflects checked=false via aria-checked', () => {
      renderSwitch(false);
      expect(screen.getByRole('switch', { name: 'Test switch' })).not.toBeChecked();
    });
  });

  describe('interaction', () => {
    it('calls onChange with true when toggled from off', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSwitch(false, onChange);
      await user.click(screen.getByRole('switch', { name: 'Test switch' }));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('calls onChange with false when toggled from on', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSwitch(true, onChange);
      await user.click(screen.getByRole('switch', { name: 'Test switch' }));
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it('calls onChange exactly once per click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      renderSwitch(false, onChange);
      await user.click(screen.getByRole('switch', { name: 'Test switch' }));
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
