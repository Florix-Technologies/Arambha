"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

export default function LoginModal({ onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        console.error('Login error:', signInError);
        return;
      }

      if (data.user) {
        setEmail('');
        setPassword('');
        onLoginSuccess();
      }
    } catch (err: any) {
      const errorMsg = err?.message || err?.toString?.() || 'Login failed. Please check your Supabase configuration.';
      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (!resetEmail.trim()) {
        setError('Please enter your email address');
        setLoading(false);
        return;
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/callback`
      });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccessMessage(`✅ Password recovery email sent to ${resetEmail}. Please check your email.`);
      setResetEmail('');
      setTimeout(() => {
        setShowResetForm(false);
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {!showResetForm ? (
          <>
            <h2 className={styles.title}>Admin Login</h2>
            <p className={styles.subtitle}>Secure access to admin panel</p>

            {error && (
              <div className={styles.errorBox}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>Password</label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  setShowResetForm(true);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textDecoration: 'underline',
                  fontWeight: 500,
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>

            <p className={styles.info}>
              Only authorized administrators can access this panel.
            </p>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Reset Password</h2>
            <p className={styles.subtitle}>Enter your email to receive a recovery link</p>

            {error && (
              <div className={styles.errorBox}>
                ⚠️ {error}
              </div>
            )}

            {successMessage && (
              <div style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: '#d1fae5',
                borderLeft: '4px solid #10b981',
                borderRadius: '4px',
                color: '#065f46',
                fontSize: '0.9rem'
              }}>
                {successMessage}
              </div>
            )}

            <form onSubmit={handleResetPassword} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="resetEmail" className={styles.label}>Email Address</label>
                <input
                  id="resetEmail"
                  type="email"
                  className={styles.input}
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Sending email...' : 'Send Recovery Email'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  setShowResetForm(false);
                  setResetEmail('');
                  setError('');
                  setSuccessMessage('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textDecoration: 'underline',
                  fontWeight: 500,
                  padding: 0
                }}
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
