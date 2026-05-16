import { TRACKS } from './tracks';
import type { TrackId } from './types';

/**
 * Build the inline `<head>` script that paints the chosen track BEFORE
 * React hydrates. Without this, mobile Safari shows one frame of the
 * neutral track even when the cookie says tipper, and it looks broken.
 *
 * Pattern lifted from "no-flash dark mode" — same idea, applied to the
 * track tokens. The token map is inlined so the script has zero deps.
 */
export function buildNoFlashScript(): string {
  const tokenMap: Record<TrackId, Record<string, string>> = {
    neutral:   { ...TRACKS.neutral.tokens },
    tipper:    { ...TRACKS.tipper.tokens },
    recipient: { ...TRACKS.recipient.tokens },
  };

  const json = JSON.stringify(tokenMap);

  return `(function(){
  try {
    var m = document.cookie.match(/(?:^|;\\s*)pt_track=([^;]+)/);
    var id = m ? m[1] : 'neutral';
    if (id !== 'tipper' && id !== 'recipient' && id !== 'neutral') id = 'neutral';
    var tokens = (${json})[id];
    var root = document.documentElement;
    Object.keys(tokens).forEach(function (k) {
      root.style.setProperty(k, tokens[k]);
    });
    root.dataset.track = id;
  } catch (e) { /* fall back to default :root tokens */ }
})();`;
}
