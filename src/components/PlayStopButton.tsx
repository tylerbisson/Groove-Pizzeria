import { COLOR_STRINGS } from '../config';

interface PlayStopButtonProps {
  paused: boolean;
  soundsReady: boolean;
  pbSize: number;
  pbLong: number;
  stopSize: number;
  onPlay: () => void;
  onStop: () => void;
}

export default function PlayStopButton({
  paused,
  soundsReady,
  pbSize,
  pbLong,
  stopSize,
  onPlay,
  onStop,
}: PlayStopButtonProps) {
  const w = Math.max(pbLong, stopSize);
  const h = Math.max(pbSize * 2, stopSize);
  const btnStyle: React.CSSProperties = {
    width: w,
    height: h,
    padding: 0,
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  return paused ? (
    <button
      aria-label={soundsReady ? 'Play' : 'Loading audio…'}
      aria-keyshortcuts="Space"
      disabled={!soundsReady}
      onClick={onPlay}
      style={btnStyle}
    >
      <span style={{
        display: 'block',
        width: 0,
        height: 0,
        borderStyle: 'solid',
        borderColor: `transparent transparent transparent ${COLOR_STRINGS.GREY}`,
        borderWidth: `${pbSize}px 0 ${pbSize}px ${pbLong}px`,
      }} />
    </button>
  ) : (
    <button
      aria-label="Stop"
      aria-keyshortcuts="Space"
      onClick={onStop}
      style={btnStyle}
    >
      <span style={{
        display: 'block',
        width: stopSize,
        height: stopSize,
        background: COLOR_STRINGS.GREY,
      }} />
    </button>
  );
}
