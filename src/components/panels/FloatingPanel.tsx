/**
 * FloatingPanel
 *
 * A fixed trigger button that opens a floating dialog panel above it.
 * Handles open/close state, focus management, outside-click, and Escape.
 * SettingsPanel and AboutPanel use this as their shared shell.
 */
import { useState, useEffect, useRef } from 'react';

interface FloatingPanelProps {
  label: string;
  icon: React.ReactNode;
  right?: number;
  minWidth?: number;
  maxWidth?: number;
  children: React.ReactNode;
}

export default function FloatingPanel({
  label,
  icon,
  right = 16,
  minWidth = 180,
  maxWidth,
  children,
}: FloatingPanelProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open) {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    } else if (prevOpenRef.current) {
      btnRef.current?.focus();
    }
    prevOpenRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
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
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 16,
          right,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1px solid var(--gp-panel-border)',
          background: 'var(--gp-panel-bg)',
          fontSize: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          backdropFilter: 'blur(4px)',
        }}
      >
        {icon}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={label}
          style={{
            position: 'fixed',
            bottom: 60,
            right,
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid var(--gp-panel-border)',
            background: 'var(--gp-panel-bg)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minWidth,
            ...(maxWidth !== undefined ? { maxWidth } : {}),
          }}
        >
          {children}
        </div>
      )}
    </>
  );
}
