import type { CSSProperties, ReactNode } from 'react';

export interface ControlColumnProps {
  color: string;
  colWidth: number;
  LG: number;
  SM: number;
  value: number;
  sliderMin: number;
  sliderMax: number;
  sliderColor: string;
  ariaLabel: string;
  largeLabel: ReactNode;
  smallLabel: ReactNode;
  extra?: ReactNode;
  onChange: (n: number) => void;
}

export default function ControlColumn({
  color, colWidth, LG, SM, value, sliderMin, sliderMax, sliderColor,
  ariaLabel, largeLabel, smallLabel, extra, onChange,
}: ControlColumnProps) {
  const text: CSSProperties = { fontFamily: 'Lekton', color, whiteSpace: 'nowrap' };
  return (
    <div style={{ width: colWidth, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ ...text, fontSize: LG }}>{largeLabel}</span>
      <span style={{ ...text, fontSize: SM }}>{smallLabel}</span>
      <input
        type="range"
        aria-label={ariaLabel}
        min={sliderMin}
        max={sliderMax}
        value={value}
        style={{ width: colWidth - 4, margin: 0, padding: 0, '--pizza-color': sliderColor } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {extra}
    </div>
  );
}
