import type { ReactNode } from 'react';
import s from './Badge.module.css';
export function Badge({ tone = 'neutral', children }: {
    tone?: 'neutral' | 'success' | 'warning' | 'danger';
    children: ReactNode;
}) { return <span className={`${s.badge} ${s[tone]}`}>{children}</span>; }
