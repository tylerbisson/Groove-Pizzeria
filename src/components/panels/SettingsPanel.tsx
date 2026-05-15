import FloatingPanel from './FloatingPanel';
import ToggleSwitch from './ToggleSwitch';
import { KIT_OPTIONS } from '../../config';
import type { RGB, LayoutMode } from '../../types';

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
    <FloatingPanel label="Settings" icon="⚙" right={16} minWidth={220}>
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
    </FloatingPanel>
  );
}
