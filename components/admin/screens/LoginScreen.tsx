"use client";
import Image from 'next/image';
import { useState } from 'react';
import { Button, Card, TextField } from '../ui';
import { TERMS, MESSAGES } from '@/lib/admin/taxonomy';
import s from './LoginScreen.module.css';
export function LoginScreen({ error }: {
    error?: string;
}) {
    const [show, setShow] = useState(false);
    return <main className={s.page}>
        <div className={s.card}>
            <Card>
                <Image src="/logo2.png" alt={TERMS.brand} width={160} height={64} />
                <h1>
                    {TERMS.loginTitle}
                </h1>
                <p>
                    {MESSAGES.loginHint}
                </p>
                <form onSubmit={e => e.preventDefault()}>
                    <TextField label={TERMS.email} type="email" autoComplete="username" />
                    <TextField label={TERMS.password} type={show ? 'text' : 'password'} autoComplete="current-password" />
                    <Button variant="plain" onClick={() => setShow(!show)}>
                        {show ? TERMS.hidePassword : TERMS.showPassword}
                    </Button>
                    <div role="alert" className={s.error}>
                        {error}
                    </div>
                    <Button type="submit" className={s.full}>
                        {TERMS.logIn}
                    </Button>
                    <Button variant="plain">
                        {TERMS.forgotPassword}
                    </Button>
                </form>
            </Card>
        </div>
    </main>;
}
