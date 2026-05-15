import FloatingPanel from './FloatingPanel';

const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: 'Space', action: 'Play / Stop' },
  { keys: '← →', action: 'Navigate steps' },
  { keys: '↑ ↓', action: 'Navigate rings' },
  { keys: 'Space / Enter', action: 'Toggle beat (on a dot)' },
];

export default function AboutPanel() {
  const labelStyle: React.CSSProperties = { fontSize: 11, color: 'var(--gp-grey)' };
  const smallStyle: React.CSSProperties = { fontSize: 10, color: 'var(--gp-grey)' };

  return (
    <FloatingPanel label="About" icon="ⓘ" right={60} minWidth={240} maxWidth={300}>
      <span style={{ ...labelStyle, marginBottom: -2 }}>About</span>

      <p style={{ margin: 0, lineHeight: 1.55, ...labelStyle }}>
        Groove Pizzeria is a polyrhythmic beat sequencer. Click or drag the dots on each pizza to
        activate beats, then adjust steps, teeth, and rotation with the sliders.
      </p>

      {/* Keyboard shortcuts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ ...smallStyle, marginBottom: 1 }}>Keyboard shortcuts</span>
        {SHORTCUTS.map(({ keys, action }) => (
          <div key={action} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <kbd
              style={{
                fontFamily: 'Lekton',
                fontSize: 10,
                color: 'var(--gp-grey)',
                border: '1px solid var(--gp-panel-border)',
                borderRadius: 3,
                padding: '1px 5px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {keys}
            </kbd>
            <span style={smallStyle}>{action}</span>
          </div>
        ))}
      </div>

      {/* Social links */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <a
          href="https://www.linkedin.com/in/tyler-bisson/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
        >
          <img
            src="/img/linkedin.png"
            alt="LinkedIn"
            style={{ width: 20, height: 20, objectFit: 'contain', display: 'block' }}
          />
        </a>
        <a
          href="https://github.com/tylerbisson"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <img
            src="/img/github.png"
            alt="GitHub"
            style={{ width: 20, height: 20, objectFit: 'contain', display: 'block' }}
          />
        </a>
      </div>
    </FloatingPanel>
  );
}
