"use client";
import { useId, type ReactNode, type InputHTMLAttributes } from 'react';
import s from './TextField.module.css';
type Props = InputHTMLAttributes<HTMLInputElement> & {
    label: ReactNode;
    hint?: ReactNode;
    error?: string;
};
export function TextField({ label, hint, error, id, readOnly, ...props }: Props) {
    const generated = useId();
    const fieldId = id ?? generated;
    const described = [hint ? `${fieldId}-hint` : null, error ? `${fieldId}-error` : null, props['aria-describedby']].filter(Boolean).join(' ') || undefined;
    return <div className={s.field}><label className={s.label} htmlFor={fieldId}>{label}</label><input {...props} id={fieldId} className={`${s.control} ${props.className ?? ''}`} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={described} readOnly={readOnly}/>{hint && <div className={s.hint} id={`${fieldId}-hint`}>{hint}</div>}{error && <div className={s.error} id={`${fieldId}-error`} role="alert">{error}</div>}</div>;
}
