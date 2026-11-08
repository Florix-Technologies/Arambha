"use client";
import Image from 'next/image';
import { useRef, useState } from 'react';
import { Button, Card, TextField } from '../ui';
import { TERMS, MESSAGES } from '@/lib/admin/taxonomy';
import s from './LoginScreen.module.css';
export function LoginScreen({ error, notice, loading = false, onSignIn, onForgotPassword }: {
    error?: string;
    notice?: string;
    onForgotPassword?: (email: string) => void;
    loading?: boolean;
    onSignIn?: (email: string, password: string) => void;
}) {
    const [show, setShow] = useState(false);
    const form = useRef<HTMLFormElement>(null);
    return <main className={s.page}>
        <div className={s.card}>
            <Card>
                <Image src="/logo2.png" alt={TERMS.brand} width={120} height={120} className={s.logo} priority />
                <h1>
                    {TERMS.loginTitle}
                </h1>
                <p>
                    {MESSAGES.loginHint}
                </p>
                <form ref={form} onSubmit={e => {
                    e.preventDefault();
                    if (loading) return;
                    const data = new FormData(e.currentTarget);
                    onSignIn?.(String(data.get('email') ?? ''), String(data.get('password') ?? ''));
                }}>
                    <TextField name="email" label={TERMS.email} type="email" autoComplete="username" required maxLength={254} disabled={loading} />
                    <TextField name="password" label={TERMS.password} type={show ? 'text' : 'password'} autoComplete="current-password" required maxLength={4096} disabled={loading} />
                    <Button variant="plain" onClick={() => setShow(!show)}>
                        {show ? TERMS.hidePassword : TERMS.showPassword}
                    </Button>
                    <div role="alert" className={s.error}>
                        {error}
                    </div>
                    <Button type="submit" loading={loading} className={s.full}>
                        {TERMS.logIn}
                    </Button>
                    <Button variant="plain" disabled={loading} onClick={() => onForgotPassword?.(String(new FormData(form.current ?? undefined).get('email') ?? ''))}>
                        {TERMS.forgotPassword}
                    </Button>
                    {notice && <p role="status">{notice}</p>}
                </form>
            </Card>
        </div>
    </main>;
}
