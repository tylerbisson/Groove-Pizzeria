import { useEffect, useRef, useState } from 'react';

const CLICK_THRESHOLD_PX = 4;

interface SpinBoxProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  shiftStep?: number;
  pixelsPerStep?: number;
  maxChars?: number;
  onChange: (n: number) => void;
  fontSize: number;
  color: string;
  ariaLabel: string;
  style?: React.CSSProperties;
}

export default function SpinBox({
  value, min, max,
  step = 1, shiftStep = 5, pixelsPerStep = 6, maxChars,
  onChange, fontSize, color, ariaLabel, style,
}: SpinBoxProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const drag = useRef({ active: false, moved: false, accum: 0 });

  const clamp = (n: number) => Math.max(min, Math.min(max, Math.round(n)));

  // Reset body cursor on unmount in case a drag was interrupted
  useEffect(() => () => { document.body.style.cursor = ''; }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.cursor = 'ew-resize';
    drag.current = { active: true, moved: false, accum: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLSpanElement>) => {
    const d = drag.current;
    if (!d.active) return;
    d.accum += e.movementX;
    if (Math.abs(d.accum) > CLICK_THRESHOLD_PX) d.moved = true;
    if (!d.moved) return;
    const steps = Math.trunc(d.accum / pixelsPerStep);
    if (steps !== 0) {
      d.accum -= steps * pixelsPerStep;
      onChange(clamp(value + steps * step));
    }
  };

  const handlePointerUp = () => {
    document.body.style.cursor = '';
    if (!drag.current.moved) {
      setDraft(String(value));
      setEditing(true);
    }
    drag.current.active = false;
  };

  const handlePointerCancel = () => {
    document.body.style.cursor = '';
    drag.current.active = false;
  };

  const commit = (raw: string) => {
    const n = parseFloat(raw);
    if (!isNaN(n)) onChange(clamp(n));
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); onChange(clamp(value + (e.shiftKey ? shiftStep : step))); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); onChange(clamp(value - (e.shiftKey ? shiftStep : step))); }
    else if (e.key === 'Home') { e.preventDefault(); onChange(min); }
    else if (e.key === 'End') { e.preventDefault(); onChange(max); }
    else if (e.key === 'Enter' || e.key === 'F2') { setDraft(String(value)); setEditing(true); }
  };

  if (editing) {
    return (
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        maxLength={maxChars ?? String(max).length}
        autoFocus
        style={{
          width: `${Math.max(2, draft.length)}ch`,
          fontSize,
          fontFamily: 'inherit',
          fontWeight: 'inherit',
          lineHeight: 'inherit',
          color,
          background: 'var(--gp-bg)',
          border: 'none',
          outline: 'none',
          padding: 0,
          margin: 0,
          verticalAlign: 'baseline',
          textAlign: 'right',
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(e.currentTarget.value); }
          else if (e.key === 'Escape') setEditing(false);
        }}
        onFocus={(e) => e.target.select()}
      />
    );
  }

  return (
    <span
      role="spinbutton"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={ariaLabel}
      tabIndex={0}
      style={{
        fontSize,
        color,
        cursor: 'ew-resize',
        userSelect: 'none',
        display: 'inline-block',
        minWidth: '2ch',
        textAlign: 'right',
        touchAction: 'none',
        ...style,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onKeyDown={handleKeyDown}
    >
      {value}
    </span>
  );
}
