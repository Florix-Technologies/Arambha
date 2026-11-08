"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TERMS } from '@/lib/admin/taxonomy';
import { Button, Card, PageHeader } from '../ui';
import s from './SettingsScreen.module.css';

export function SettingsScreen() {
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
    useEffect(() => { void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? '')); }, []);
    async function sendReset() {
        if (!email || busy) return;
        setBusy(true); setMessage(null);
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback` })
            .catch(() => ({ error: true }));
        setBusy(false);
        setMessage(error ? { ok: false, text: 'Could not send the email. Wait a minute, then try again.' } : { ok: true, text: `Reset link sent to ${email}. Open it to choose a new password.` });
    }
    return <div className={s.page}>
        <PageHeader breadcrumbs={[{ label: TERMS.dashboard, href: '/admin' }, { label: TERMS.settings }]} title={TERMS.settings} />
        <Card title={TERMS.account}>
            <dl className={s.list}>
                <div><dt>{TERMS.email}</dt><dd>{email || '…'}</dd></div>
                <div><dt>{TERMS.password}</dt><dd>
                    <p>We email you a link to choose a new password.</p>
                    <Button variant="secondary" loading={busy} disabled={!email} onClick={() => void sendReset()}>Email me a reset link</Button>
                    {message && <p role={message.ok ? 'status' : 'alert'} className={message.ok ? s.ok : s.error}>{message.text}</p>}
                </dd></div>
                <div><dt>Automatic log out</dt><dd><p>After 30 minutes without activity, with a one-minute warning.</p></dd></div>
            </dl>
        </Card>
    </div>;
}
