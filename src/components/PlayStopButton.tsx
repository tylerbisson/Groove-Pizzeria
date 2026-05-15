import { COLOR_STRINGS } from '../config';

interface PlayStopButtonProps {
  paused: boolean;
  soundsReady: boolean;
  top: number | string;
  playLeft: number | string;
  stopLeft: number | string;
  pbSize: number;
  pbLong: number;
  stopSize: number;
  onPlay: () => void;
  onStop: () => void;
}

export default function PlayStopButton({
  paused,
  soundsReady,
  top,
  playLeft,
  stopLeft,
  pbSize,
  pbLong,
  stopSize,
  onPlay,
  onStop,
}: PlayStopButtonProps) {
  return paused ? (
    <button
      aria-label={soundsReady ? 'Play' : 'Loading audio…'}
      aria-keyshortcuts="Space"
      disabled={!soundsReady}
      onClick={onPlay}
      style={{
        position: 'absolute',
        top,
        left: playLeft,
        width: 0,
        height: 0,
        padding: 0,
        background: 'none',
        border: 'none',
        borderStyle: 'solid',
        cursor: 'pointer',
        borderColor: `transparent transparent transparent ${COLOR_STRINGS.GREY}`,
        borderWidth: `${pbSize}px 0 ${pbSize}px ${pbLong}px`,
      }}
    />
  ) : (
    <button
      aria-label="Stop"
      aria-keyshortcuts="Space"
      onClick={onStop}
      style={{
        position: 'absolute',
        top,
        left: stopLeft,
        padding: 0,
        border: 'none',
        cursor: 'pointer',
        width: stopSize,
        height: stopSize,
        background: COLOR_STRINGS.GREY,
      }}
    />
  );
}
