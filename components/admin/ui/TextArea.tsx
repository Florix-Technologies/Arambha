"use client";
import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import s from './TextArea.module.css';
type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: ReactNode;
    hint?: ReactNode;
    error?: string;
};
export function TextArea({ label, hint, error, id, readOnly, children, ...props }: Props) {
    const generated = useId();
    const fieldId = id ?? generated;
    const described = [hint ? `${fieldId}-hint` : null, error ? `${fieldId}-error` : null, props['aria-describedby']].filter(Boolean).join(' ') || undefined;
    return <div className={s.field}><label className={s.label} htmlFor={fieldId}>{label}</label><textarea {...props} id={fieldId} className={`${s.control} ${props.className ?? ''}`} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={described} readOnly={readOnly}>{children}</textarea>{hint && <div className={s.hint} id={`${fieldId}-hint`}>{hint}</div>}{error && <div className={s.error} id={`${fieldId}-error`} role="alert">{error}</div>}</div>;
}
