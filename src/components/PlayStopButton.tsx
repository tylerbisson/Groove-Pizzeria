import { COLOR_STRINGS } from '../config';

interface PlayStopButtonProps {
  paused: boolean;
  soundsReady: boolean;
  pbSize: number;
  pbLong: number;
  stopSize: number;
  onPlay: () => void;
  onStop: () => void;
  // Optional absolute positioning — omit to let the button flow in a flex container
  top?: number | string;
  playLeft?: number | string;
  stopLeft?: number | string;
}

export default function PlayStopButton({
  paused,
  soundsReady,
  pbSize,
  pbLong,
  stopSize,
  onPlay,
  onStop,
  top,
  playLeft,
  stopLeft,
}: PlayStopButtonProps) {
  const positioned = top !== undefined;
  return paused ? (
    <button
      aria-label={soundsReady ? 'Play' : 'Loading audio…'}
      aria-keyshortcuts="Space"
      disabled={!soundsReady}
      onClick={onPlay}
      style={{
        position: positioned ? 'absolute' : 'relative',
        ...(positioned && { top, left: playLeft }),
        width: 0,
        height: 0,
        padding: 0,
        borderStyle: 'solid',
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
        position: positioned ? 'absolute' : 'relative',
        ...(positioned && { top, left: stopLeft }),
        padding: 0,
        width: stopSize,
        height: stopSize,
        background: COLOR_STRINGS.GREY,
      }}
    />
  );
}
