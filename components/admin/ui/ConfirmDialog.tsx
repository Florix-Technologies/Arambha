"use client";
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { TextField } from './TextField';
import { MESSAGES, TERMS } from '@/lib/admin/taxonomy';
import s from './ConfirmDialog.module.css';
type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    body: string;
    confirmLabel: string;
    onConfirm: () => void;
    destructive?: boolean;
    typeToConfirm?: string;
    loading?: boolean;
};
export function ConfirmDialog(props: Props) { return <Modal open={props.open} onOpenChange={props.onOpenChange} title={props.title} description={props.body}><ConfirmationForm key={props.typeToConfirm} {...props}/></Modal>; }
function ConfirmationForm({ onOpenChange, confirmLabel, onConfirm, destructive = false, typeToConfirm, loading = false }: Props) {
    const [typed, setTyped] = useState('');
    return <form onSubmit={e => { e.preventDefault(); if (!loading && (!typeToConfirm || typed === typeToConfirm))
        onConfirm(); }}>{typeToConfirm && <TextField label={MESSAGES.typeToConfirm(typeToConfirm)} value={typed} onChange={e => setTyped(e.target.value)} autoComplete="off"/>}<div className={s.actions}><Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>{TERMS.cancel}</Button><Button type="submit" variant={destructive ? 'destructive' : 'primary'} disabled={!!typeToConfirm && typed !== typeToConfirm} loading={loading}>{confirmLabel}</Button></div></form>;
}
