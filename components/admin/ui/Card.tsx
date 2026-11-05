import type { ReactNode } from 'react';
import s from './Card.module.css';
export function Card({ title, actions, children }: {
    title?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
}) { return <section className={s.card}>{(title || actions) && <div className={s.header}>{title && <h2>{title}</h2>}<div className={s.actions}>{actions}</div></div>}{children}</section>; }
