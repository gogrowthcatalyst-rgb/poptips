import { ImageResponse } from 'next/og';

export const alt = 'Pop Tips — One-to-one tipping, directly. Empowering the appreciation economy.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Open Graph card. Generated via @vercel/og (built into Next 15).
 *
 * Edge runtime fetches the Fraunces font at request time. On Vercel
 * this works automatically; locally it requires network access to
 * fonts.googleapis.com which our sandbox blocks (build still succeeds
 * because the OG image is generated at runtime, not build time).
 */
export default async function OGImage() {
  // Fetch Fraunces (serif, italic) for the headline
  const fraunces = await fetch(
    'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,500&display=swap',
  )
    .then((r) => r.text())
    .then((css) => {
      const m = css.match(/src: url\((.+?)\) format/);
      return m ? fetch(m[1]).then((r) => r.arrayBuffer()) : null;
    })
    .catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FBF7F1',
          padding: '80px',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Decorative coral blur — top right */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: '#FFA587',
            opacity: 0.4,
            filter: 'blur(80px)',
          }}
        />
        {/* Decorative jade blur — bottom left */}
        <div
          style={{
            position: 'absolute',
            bottom: -120,
            left: -120,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: '#6BA589',
            opacity: 0.4,
            filter: 'blur(80px)',
          }}
        />

        {/* Top — eyebrow + brand mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#F06844',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FBF7F1',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            $
          </div>
          <div
            style={{
              fontSize: 28,
              fontFamily: 'sans-serif',
              fontWeight: 500,
              color: '#0E1420',
              letterSpacing: '-0.02em',
            }}
          >
            pop.tips
          </div>
        </div>

        {/* Middle — Kelly's primary tagline leads, Empowering supports beneath */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              fontSize: 32,
              fontFamily: 'monospace',
              fontWeight: 500,
              color: '#F06844',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}
          >
            The appreciation economy
          </div>
          <div
            style={{
              fontSize: 92,
              fontStyle: 'italic',
              color: '#0E1420',
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              fontWeight: 500,
              maxWidth: 1050,
            }}
          >
            One-to-one tipping. Directly.
          </div>
          <div
            style={{
              fontSize: 38,
              fontFamily: 'sans-serif',
              color: '#4B5669',
              maxWidth: 900,
              lineHeight: 1.3,
              fontWeight: 400,
            }}
          >
            Empowering the appreciation economy.
          </div>
        </div>

        {/* Bottom — supporting line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontFamily: 'sans-serif',
              color: '#4B5669',
              maxWidth: 600,
              lineHeight: 1.3,
            }}
          >
            100% to the worker. Instantly.
          </div>
          <div
            style={{
              fontSize: 24,
              fontFamily: 'monospace',
              color: '#8A94A7',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
            }}
          >
            pop.tips
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fraunces
        ? [{ name: 'Fraunces', data: fraunces, style: 'italic', weight: 500 }]
        : undefined,
    },
  );
}
