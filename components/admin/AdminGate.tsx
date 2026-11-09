"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { categoryFromParam, MESSAGES, TERMS, type CategoryKey } from '@/lib/admin/taxonomy';
import { useInactivityLogout } from './useInactivityLogout';
import { CatalogProvider } from './useCatalog';
import { TourProvider } from './Tour';
import { AdminShell, type ActiveKey } from './AdminShell';
import { LoginScreen } from './screens/LoginScreen';
import { Button, Card, Modal, ToastProvider } from './ui';

// Lets a screen whose URL has no category (the product form) mark its main category as active in the navigation.
const ActiveCategory = createContext<(key: CategoryKey | null) => void>(() => {});
export function useActiveCategory(key: CategoryKey | null) {
    const set = useContext(ActiveCategory);
    useEffect(() => { set(key); return () => set(null); }, [key, set]);
}

export function AdminGate({ children, login = false }: { children?: ReactNode; login?: boolean }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [checking, setChecking] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
    const signingOut = useRef(false);
    const submitting = useRef(false);

    useEffect(() => {
        let disposed = false;
        let revision = 0;
        let userId: string | null = null;
        // background: a re-check for the user already shown. A network failure there must not unmount the
        // screen (unsaved edits, uploads); only a definite "no valid user" answer signs the admin out.
        const verify = async (background = false) => {
            const current = ++revision;
            try {
                // Verify with Auth; a locally stored session alone is not proof of identity.
                const { data, error } = await supabase.auth.getUser();
                if (!disposed && current === revision && !signingOut.current) {
                    if (background && error && error.status !== 401 && error.status !== 403) return;
                    userId = error ? null : data.user?.id ?? null;
                    setUser(error ? null : data.user);
                    setChecking(false);
                }
            } catch {
                if (!disposed && current === revision && !signingOut.current && !background) {
                    userId = null;
                    setUser(null);
                    setChecking(false);
                }
            }
        };
        void verify();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const current = ++revision;
            const nextUserId = event === 'SIGNED_OUT' ? null : session?.user.id ?? null;
            const sameUser = event !== 'SIGNED_OUT' && nextUserId === userId;
            if (!sameUser) {
                userId = nextUserId;
                setUser(null);
                setChecking(nextUserId !== null);
            }
            if (!nextUserId) return;
            // Run outside the Auth callback to avoid its session lock.
            setTimeout(() => { if (!disposed && current === revision && !signingOut.current) void verify(sameUser); }, 0);
        });
        return () => { disposed = true; ++revision; subscription.unsubscribe(); };
    }, []);

    useEffect(() => {
        if (checking || signingOut.current || error) return;
        if (!user && !login) router.replace('/admin/login');
        if (user && login) router.replace('/admin');
    }, [checking, user, login, router, error]);

    const logOut = async () => {
        if (signingOut.current) return;
        signingOut.current = true;
        setBusy(true);
        setError('');
        setUser(null);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.replace('/admin/login');
        } catch {
            setError('Could not end your session. Please retry logging out.');
        } finally {
            signingOut.current = false;
            setChecking(false);
            setBusy(false);
        }
    };

    const { secondsLeft, stayLoggedIn } = useInactivityLogout({
        enabled: !!user && !login,
        idleLimitMs: 30 * 60 * 1000,
        warningMs: 60 * 1000,
        onTimeout: () => { void logOut(); },
    });

    const signIn = async (email: string, password: string) => {
        if (submitting.current) return;
        email = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !password || password.length > 4096) {
            setError('Enter a valid email and password.');
            return;
        }
        submitting.current = true;
        setBusy(true);
        setError('');
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError('Could not log in. Check your email and password and try again.');
        } catch {
            setError('Could not reach the login service. Please try again.');
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    };

    const forgotPassword = async (email: string) => {
        email = email.trim();
        setNotice('');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter your email above, then choose "Forgot password?" again.'); return; }
        setError('');
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback` })
            .catch(() => ({ error: true }));
        if (error) setError('Could not send the reset email. Please try again in a minute.');
        else setNotice(`If ${email} is an admin account, a password reset link is on its way. Check your inbox.`);
    };

    if (error && !login) return <Card><p role="alert">{error}</p><Button loading={busy} onClick={() => void logOut()}>{TERMS.logOut}</Button></Card>;
    if (checking || (busy && !login) || (login && user) || (!login && !user)) return <p role="status">{TERMS.loading}…</p>;
    if (login) return <LoginScreen error={error} notice={notice} loading={busy} onSignIn={signIn} onForgotPassword={email => void forgotPassword(email)} />;

    const segment = pathname.split('/')[2] ?? '';
    const active: ActiveKey = segment === '' ? 'dashboard' : segment === 'media' || segment === 'settings' || segment === 'help' ? segment
        : categoryFromParam(segment)?.key ?? activeCategory;
    return <ToastProvider><CatalogProvider><TourProvider><ActiveCategory.Provider value={setActiveCategory}><AdminShell active={active} userEmail={user?.email ?? ''} onLogOut={() => void logOut()}>
        {children}
        <Modal open={secondsLeft !== null} onOpenChange={open => { if (!open) stayLoggedIn(); }} title={MESSAGES.sessionTitle} description={MESSAGES.sessionBody}>
            <p role="status">Logging out in {secondsLeft ?? 0} {secondsLeft === 1 ? 'second' : 'seconds'}.</p>
            <Button onClick={stayLoggedIn}>Stay logged in</Button>
            <Button variant="plain" onClick={() => void logOut()}>{TERMS.logOut}</Button>
        </Modal>
    </AdminShell></ActiveCategory.Provider></TourProvider></CatalogProvider></ToastProvider>;
}
