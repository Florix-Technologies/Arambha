"use client";
import { useEffect } from 'react';
import Link from 'next/link';
import styles from './error.module.css';

export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Page failed to load:', error);
  }, [error]);

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>This page didn&apos;t load properly</h1>
      <p className={styles.text}>Sorry about that. Please try again, or head back to the home page.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={reset}>Try again</button>
        <Link href="/" className={styles.secondary}>Go to the home page</Link>
      </div>
    </div>
  );
}
