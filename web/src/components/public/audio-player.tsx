'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

// Static waveform bar heights (decorative)
const BAR_HEIGHTS = [
  12, 20, 28, 18, 32, 24, 30, 16, 26, 20, 14, 22, 28, 18, 32, 26, 20, 30,
  14, 24, 18, 28, 22, 16, 26, 20, 32, 18, 24, 14,
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface AudioPlayerProps {
  audioUrl: string;
  duration: number;
  label?: string;
}

export function AudioPlayer({ audioUrl, duration, label }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const activeBarCount = Math.floor((progress / 100) * BAR_HEIGHTS.length);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      const bar = progressRef.current;
      if (!audio || !bar) return;

      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = ratio * duration;
      setCurrentTime(audio.currentTime);
    },
    [duration],
  );

  return (
    <div className="bg-[rgba(124,92,252,0.06)] border border-[rgba(124,92,252,0.12)] rounded-xl p-5">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex items-center gap-4">
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="w-[52px] h-[52px] rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] hover:scale-[1.08] flex items-center justify-center flex-shrink-0 transition-all duration-150 border-none cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white ml-0.5">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          )}
        </button>

        {/* Track details */}
        <div className="flex-1">
          {label && (
            <div className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-2">
              {label}
            </div>
          )}

          {/* Progress bar */}
          <div
            ref={progressRef}
            onClick={handleSeek}
            className="w-full h-1.5 bg-[rgba(255,255,255,0.08)] rounded-sm overflow-hidden cursor-pointer mb-1.5"
          >
            <div
              className="h-full bg-[var(--accent)] rounded-sm transition-[width] duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Times */}
          <div className="flex justify-between text-xs text-[var(--text-muted)] tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Waveform visualization */}
      <div className="flex items-center gap-[2px] h-8 mt-3">
        {BAR_HEIGHTS.map((height, i) => (
          <div
            key={i}
            className="w-[3px] rounded-sm bg-[var(--accent)]"
            style={{
              height: `${height}px`,
              opacity: i < activeBarCount ? 0.8 : 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
