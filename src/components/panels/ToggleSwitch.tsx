interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  fontSize: number;
}

export default function ToggleSwitch({ checked, onChange, label, fontSize }: ToggleSwitchProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span aria-hidden="true" style={{ fontSize }}>
        ☀️
      </span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className="gp-toggle"
        onClick={() => onChange(!checked)}
      >
        <span className="gp-toggle-thumb" />
      </button>
      <span aria-hidden="true" style={{ fontSize }}>
        🌙
      </span>
    </div>
  );
}
