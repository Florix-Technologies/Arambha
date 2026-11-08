import type { ReactNode } from 'react';
import { Breadcrumbs, type Breadcrumb } from './Breadcrumbs';
import { Menu, type MenuItem } from './Menu';
import { TERMS } from '@/lib/admin/taxonomy';
import s from './PageHeader.module.css';
export function PageHeader({ breadcrumbs, title, subtitle, primaryAction, secondaryActions, menu }: {
    breadcrumbs?: Breadcrumb[];
    title: string;
    subtitle?: ReactNode;
    primaryAction?: ReactNode;
    secondaryActions?: ReactNode;
    menu?: MenuItem[];
}) { return <header className={s.header}>{breadcrumbs && <Breadcrumbs items={breadcrumbs}/>}<div className={s.row}><div className={s.copy}><h1>{title}</h1>{subtitle && <div className={s.subtitle}>{subtitle}</div>}</div><div className={s.actions}>{secondaryActions}{primaryAction}{menu && <Menu ariaLabel={TERMS.more} items={menu}/>}</div></div></header>; }
