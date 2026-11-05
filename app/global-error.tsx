"use client";
import { useEffect } from 'react';

// Replaces the root layout when the layout itself fails, so nothing from globals.css or next/font can be relied on.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Site failed to load:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#F2F0EB', color: '#363230', fontFamily: 'Georgia, serif' }}>
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1.5rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 500, margin: 0 }}>Arambha Design &amp; Interior Studio</h1>
          <p style={{ maxWidth: '32rem', lineHeight: 1.6, margin: 0 }}>
            Something went wrong while loading the site. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ minHeight: 44, padding: '0.5rem 1.5rem', border: 'none', borderRadius: 8, background: '#594D3F', color: '#fff', fontSize: '1rem', cursor: 'pointer' }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
