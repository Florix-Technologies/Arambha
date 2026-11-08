import type { ReactNode } from 'react';
import s from './EmptyState.module.css';
export function EmptyState({ icon, title, text, action }: {
    icon: ReactNode;
    title: string;
    text: string;
    action?: ReactNode;
}) { return <div className={s.empty}><div className={s.icon} aria-hidden="true">{icon}</div><h2>{title}</h2><p>{text}</p>{action}</div>; }
