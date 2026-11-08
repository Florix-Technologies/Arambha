"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import modalStyles from '@/components/layout/LoginModal.module.css';
import styles from './page.module.css';

const MIN_PASSWORD_LENGTH = 8;
const REDIRECT_DELAY_MS = 2000;

// supabase-js clears the URL hash as soon as it has read the recovery token, so it is captured when this module loads.
const initialHash = typeof window === 'undefined' ? '' : window.location.hash.replace(/^#/, '');

type Status = 'checking' | 'ready' | 'invalid' | 'done';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    let recoveryEventSeen = false;
    const show = (next: Status) => { if (active) setStatus(next); };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        recoveryEventSeen = true;
        show('ready');
      }
    });

    async function verifyLink() {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(initialHash);
      if (query.get('error') || hash.get('error')) return show('invalid');

      // Waits for supabase-js to finish reading any token in the URL.
      const { data: { session } } = await supabase.auth.getSession();

      const code = query.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState(null, '', window.location.pathname);
        return show(exchangeError && !recoveryEventSeen ? 'invalid' : 'ready');
      }
      // A failed link leaves any existing session in place, so the session must be the one this link's token created.
      const accessToken = hash.get('access_token');
      const verified = hash.get('type') === 'recovery' && !!accessToken && session?.access_token === accessToken;
      if (verified) return show('ready');
      if (!recoveryEventSeen) show('invalid');
    }

    verifyLink().catch((err) => {
      console.error('Could not verify the password reset link:', err);
      show('invalid');
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (status !== 'done') return;
    const timer = setTimeout(() => router.replace('/admin'), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPassword('');
    setConfirmPassword('');
    setStatus('done');
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modal}>
        {status === 'checking' && (
          <>
            <h1 className={modalStyles.title}>Checking your link</h1>
            <p className={modalStyles.subtitle}>One moment…</p>
          </>
        )}

        {status === 'invalid' && (
          <>
            <h1 className={modalStyles.title}>Link not valid</h1>
            <div className={modalStyles.errorBox}>
              This password reset link is invalid or has expired. Request a new one from the login page.
            </div>
            <Link href="/admin" className={styles.backLink}>Back to admin login</Link>
          </>
        )}

        {status === 'ready' && (
          <>
            <h1 className={modalStyles.title}>Set new password</h1>
            <p className={modalStyles.subtitle}>Use at least {MIN_PASSWORD_LENGTH} characters.</p>
            {error && <div className={modalStyles.errorBox}>{error}</div>}
            <form onSubmit={handleSubmit} className={modalStyles.form}>
              <div className={modalStyles.formGroup}>
                <label htmlFor="newPassword" className={modalStyles.label}>New password</label>
                <input
                  id="newPassword"
                  type="password"
                  className={modalStyles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={saving}
                />
              </div>
              <div className={modalStyles.formGroup}>
                <label htmlFor="confirmPassword" className={modalStyles.label}>Confirm new password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={modalStyles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={saving}
                />
              </div>
              <button type="submit" className={modalStyles.submitButton} disabled={saving}>
                {saving ? 'Saving…' : 'Save new password'}
              </button>
            </form>
          </>
        )}

        {status === 'done' && (
          <>
            <h1 className={modalStyles.title}>Password updated</h1>
            <div className={styles.successBox}>Your new password is saved. Taking you to the admin panel…</div>
            <Link href="/admin" className={styles.backLink}>Go to the admin panel now</Link>
          </>
        )}
      </div>
    </div>
  );
}
