"use client";
import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import s from './SelectField.module.css';
type Props = SelectHTMLAttributes<HTMLSelectElement> & {
    label: ReactNode;
    hint?: ReactNode;
    error?: string;
} & {
    readOnly?: boolean;
};
export function SelectField({ label, hint, error, id, readOnly, children, ...props }: Props) {
    const generated = useId();
    const fieldId = id ?? generated;
    const described = [hint ? `${fieldId}-hint` : null, error ? `${fieldId}-error` : null, props['aria-describedby']].filter(Boolean).join(' ') || undefined;
    return <div className={s.field}><label className={s.label} htmlFor={fieldId}>{label}</label><select {...props} id={fieldId} className={`${s.control} ${props.className ?? ''}`} aria-invalid={error ? true : props['aria-invalid']} aria-describedby={described} aria-readonly={readOnly || undefined} onPointerDown={e => { if (readOnly)
        e.preventDefault(); props.onPointerDown?.(e); }} onKeyDown={e => { if (readOnly && e.key !== 'Tab')
        e.preventDefault(); props.onKeyDown?.(e); }} onChange={e => { if (!readOnly)
        props.onChange?.(e); }}>{children}</select>{hint && <div className={s.hint} id={`${fieldId}-hint`}>{hint}</div>}{error && <div className={s.error} id={`${fieldId}-error`} role="alert">{error}</div>}</div>;
}
