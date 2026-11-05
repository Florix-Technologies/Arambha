import { TERMS } from '@/lib/admin/taxonomy';
import s from './Skeleton.module.css';
export function Skeleton({ lines = 3 }: {
    lines?: number;
}) { return <div className={s.skeleton} role="status" aria-label={TERMS.loading}>{Array.from({ length: lines }, (_, i) => <div className={s.line} key={i}/>)}</div>; }
