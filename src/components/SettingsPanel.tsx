import { useState, useEffect, useRef } from 'react';
import ToggleSwitch from './ToggleSwitch';
import { KIT_OPTIONS } from '../config';
import type { RGB, LayoutMode } from '../types';

const LAYOUT_MODES: LayoutMode[] = ['auto', 'portrait', 'landscape'];

interface SettingsPanelProps {
  highContrast: boolean;
  onHighContrastChange: (val: boolean) => void;
  fontSize: number;
  kits: string[];
  onKitChange: (index: number, kit: string) => void;
  pizzaColors: RGB[];
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
}

export default function SettingsPanel({
  highContrast,
  onHighContrastChange,
  fontSize,
  kits,
  onKitChange,
  pizzaColors,
  layoutMode,
  onLayoutModeChange,
}: SettingsPanelProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLButtonElement>(null);
  const prevOpenRef = useRef(false);

  // Move focus in when panel opens; return it to gear when panel closes.
  useEffect(() => {
    if (open) {
      const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else if (prevOpenRef.current) {
      gearRef.current?.focus();
    }
    prevOpenRef.current = open;
  }, [open]);

  // Close on outside click.
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

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const labelStyle: React.CSSProperties = {
    fontSize: Math.max(fontSize - 2, 9),
    color: 'var(--gp-grey)',
  };

  const segBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '3px 0',
    fontSize: Math.max(fontSize - 2, 9),
    fontFamily: 'Lekton',
    border: '1px solid var(--gp-panel-border)',
    borderRadius: 4,
    cursor: 'pointer',
    background: active ? 'var(--gp-grey)' : 'transparent',
    color: active ? 'var(--gp-panel-bg)' : 'var(--gp-grey)',
  });

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
            gap: 10,
            minWidth: 220,
          }}
        >
          <span style={{ ...labelStyle, marginBottom: -2 }}>Settings</span>

          {/* Layout override */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={labelStyle}>Layout</span>
            <div role="group" aria-label="Layout mode" style={{ display: 'flex', gap: 3 }}>
              {LAYOUT_MODES.map((mode) => (
                <button
                  key={mode}
                  aria-pressed={layoutMode === mode}
                  onClick={() => onLayoutModeChange(mode)}
                  style={segBtnStyle(layoutMode === mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* High contrast */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ToggleSwitch
              checked={highContrast}
              onChange={onHighContrastChange}
              label="High contrast mode"
              fontSize={fontSize}
            />
            <span style={labelStyle}>High contrast</span>
          </div>

          {/* Kit selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={labelStyle}>Kits</span>
            {pizzaColors.map(([r, g, b], i) => (
              <select
                key={i}
                aria-label={`Pizza ${i + 1} kit`}
                value={kits[i]}
                style={{
                  fontFamily: 'Lekton',
                  fontSize: Math.max(fontSize - 2, 9),
                  border: '1px solid var(--gp-panel-border)',
                  borderRadius: 4,
                  padding: '2px 4px',
                  cursor: 'pointer',
                  color: `rgb(${r},${g},${b})`,
                  background: `rgba(${r},${g},${b},0.15)`,
                  width: '100%',
                }}
                onChange={(e) => onKitChange(i, e.target.value)}
              >
                {KIT_OPTIONS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
