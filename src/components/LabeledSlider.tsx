import type { CSSProperties, ReactNode } from 'react';

export interface LabeledSliderProps {
  color: string;
  largeFont: number;
  smallFont: number;
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

export default function LabeledSlider({
  color,
  largeFont,
  smallFont,
  value,
  sliderMin,
  sliderMax,
  sliderColor,
  ariaLabel,
  largeLabel,
  smallLabel,
  extra,
  onChange,
}: LabeledSliderProps) {
  const text: CSSProperties = { fontFamily: 'Lekton', color, whiteSpace: 'nowrap' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ ...text, fontSize: largeFont }}>{largeLabel}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ ...text, fontSize: smallFont }}>{smallLabel}</span>
        <input
          type="range"
          aria-label={ariaLabel}
          min={sliderMin}
          max={sliderMax}
          value={value}
          style={{ width: '100%', margin: 0, padding: 0, '--pizza-color': sliderColor } as CSSProperties}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {extra}
      </div>
    </div>
  );
}
