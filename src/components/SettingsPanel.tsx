import { useState, useEffect, useRef } from 'react';
import ToggleSwitch from './ToggleSwitch';

interface SettingsPanelProps {
  highContrast: boolean;
  onHighContrastChange: (val: boolean) => void;
  fontSize: number;
}

export default function SettingsPanel({
  highContrast,
  onHighContrastChange,
  fontSize,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        gearRef.current &&
        !gearRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        ref={gearRef}
        aria-label="Settings"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid var(--gp-panel-border)',
          background: 'var(--gp-panel-bg)',
          cursor: 'pointer',
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          backdropFilter: 'blur(4px)',
        }}
      >
        ⚙
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Settings"
          style={{
            position: 'fixed',
            bottom: 60,
            right: 16,
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid var(--gp-panel-border)',
            background: 'var(--gp-panel-bg)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            minWidth: 180,
          }}
        >
          <span
            style={{
              fontSize: Math.max(fontSize - 2, 10),
              color: 'var(--gp-grey)',
              marginBottom: 4,
            }}
          >
            Settings
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ToggleSwitch
              checked={highContrast}
              onChange={onHighContrastChange}
              label="High contrast mode"
              fontSize={fontSize}
            />
            <span style={{ fontSize: Math.max(fontSize - 2, 10), color: 'var(--gp-grey)' }}>
              High contrast
            </span>
          </div>
        </div>
      )}
    </>
  );
}
