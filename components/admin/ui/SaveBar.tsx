"use client";
import { Button } from './Button';
import { TERMS } from '@/lib/admin/taxonomy';
import s from './SaveBar.module.css';
export function SaveBar({ label = TERMS.unsavedChanges, onDiscard, onSave, loading = false, disabled = false }: {
    label?: string;
    onDiscard: () => void;
    onSave: () => void;
    loading?: boolean;
    disabled?: boolean;
}) { return <div className={s.bar} data-tour="save-bar" role="region" aria-label={label}><span role="status">{label}</span><div className={s.actions}><Button variant="secondary" onClick={onDiscard} disabled={loading}>{TERMS.discard}</Button><Button onClick={onSave} loading={loading} disabled={disabled}>{TERMS.save}</Button></div></div>; }
