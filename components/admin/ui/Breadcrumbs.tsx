import Link from 'next/link';
import { TERMS } from '@/lib/admin/taxonomy';
import s from './Breadcrumbs.module.css';
export type Breadcrumb = {
    label: string;
    href?: string;
};
export function Breadcrumbs({ items }: {
    items: Breadcrumb[];
}) { return <nav aria-label={TERMS.navigation}><ol className={s.list}>{items.map((item, i) => <li key={i}>{i > 0 && <span aria-hidden="true">/</span>}{item.href && i < items.length - 1 ? <Link href={item.href}>{item.label}</Link> : <span aria-current={i === items.length - 1 ? 'page' : undefined}>{item.label}</span>}</li>)}</ol></nav>; }
