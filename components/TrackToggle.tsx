'use client';

import { useTrack, TRACK_IDS, TRACKS, type TrackId } from '@/lib/track';
import { cn } from '@/lib/cn';
import { track } from '@/lib/analytics';

export function TrackToggle() {
  const { trackId, applyTrack } = useTrack();

  const onPick = (id: TrackId) => {
    if (id !== trackId) {
      track('track_changed', { from: trackId, to: id, via: 'toggle' });
    }
    applyTrack(id);
  };

  return (
    <div
      role="tablist"
      aria-label="Switch track"
      className="inline-flex gap-0.5 rounded-full border border-line-soft bg-paper p-1 shadow-sm"
    >
      {TRACK_IDS.map((id: TrackId) => {
        const tk = TRACKS[id];
        const active = id === trackId;
        return (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={active}
            data-track-target={id}
            onClick={() => onPick(id)}
            className={cn(
              'flex min-w-0 cursor-pointer flex-col items-center gap-0.5 rounded-full px-3 py-2 text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-glow sm:min-w-24 sm:px-4 sm:py-3',
              active
                ? 'bg-accent text-paper shadow-sm'
                : 'bg-transparent text-ink-dim hover:text-ink',
            )}
          >
            <span className="font-semibold tracking-tight">{tk.label}</span>
            <span className="hidden font-display text-[10px] font-normal italic opacity-80 sm:block">
              {tk.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
