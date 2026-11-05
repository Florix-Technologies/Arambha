"use client";
import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import s from './Button.module.css';
type Common = {
    variant?: 'primary' | 'secondary' | 'plain' | 'destructive';
    loading?: boolean;
    disabled?: boolean;
    children: ReactNode;
};
type Props = Common & ((ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
}) | (AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
}));
export function Button({ variant = 'primary', loading = false, disabled, children, className = '', ...props }: Props) {
    const classes = `${s.button} ${s[variant]} ${className}`;
    const content = <>{loading && <span className={s.spinner} aria-hidden="true"/>}{children}</>;
    if (props.href !== undefined) {
        const { href, onClick, ...linkProps } = props as AnchorHTMLAttributes<HTMLAnchorElement> & {
            href: string;
        };
        return <Link {...linkProps} href={href} className={classes} aria-disabled={disabled || loading || undefined} aria-busy={loading || undefined} tabIndex={disabled || loading ? -1 : linkProps.tabIndex} onClick={e => { if (disabled || loading)
            e.preventDefault();
        else
            onClick?.(e); }}>{content}</Link>;
    }
    const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;
    return <button {...buttonProps} type={buttonProps.type ?? 'button'} className={classes} disabled={disabled || loading} aria-busy={loading || undefined}>{content}</button>;
}
