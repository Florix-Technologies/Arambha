"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { LayoutDashboard, Armchair, House, Images, MoreHorizontal, CircleHelp, UserRound, Search } from 'lucide-react';
import { CATEGORIES, CATEGORY_KEYS, TERMS, type CategoryKey } from '@/lib/admin/taxonomy';
import { Menu, type MenuItem } from './ui/Menu';
import { Modal } from './ui/Modal';
import s from './AdminShell.module.css';
type ActiveKey = 'dashboard' | CategoryKey | 'help' | 'more';
type Props = {
    active: ActiveKey;
    userEmail: string;
    basePath?: string;
    children: ReactNode;
    onChangePassword?: () => void;
    onLogOut?: () => void;
    onSearch?: (query: string) => void;
};
const icons = { dashboard: LayoutDashboard, furniture: Armchair, interiors: House, gallery: Images };
export function AdminShell({ active, userEmail, basePath = '/admin', children, onChangePassword, onLogOut, onSearch }: Props) {
    const [searchOpen, setSearchOpen] = useState(false);
    const base = basePath.replace(/\/$/, '');
    const account: MenuItem[] = [{ label: TERMS.email + ': ' + userEmail, disabled: true }, { label: TERMS.changePassword, href: onChangePassword ? undefined : `${base}/change-password`, onSelect: onChangePassword }, { label: TERMS.logOut, href: onLogOut ? undefined : `${base}/logout`, onSelect: onLogOut }];
    const nav = [{ key: 'dashboard' as const, label: TERMS.dashboard, href: base }, ...CATEGORY_KEYS.map(key => ({ key, label: CATEGORIES[key].label, href: `${base}/${key}` }))];
    const search = () => <form className={s.search} action={onSearch ? undefined : `${base}/search`} onSubmit={onSearch ? e => { e.preventDefault(); const data = new FormData(e.currentTarget); onSearch(String(data.get('q') ?? '')); } : undefined}><Search size={18} aria-hidden="true"/><input type="search" name="q" onKeyDown={e => e.stopPropagation()} placeholder={TERMS.search} aria-label={TERMS.search}/></form>;
    const logo = <Link href={base} className={s.logo} aria-label={TERMS.dashboard}><Image src="/logo2.png" alt={TERMS.brand} width={140} height={48} className={s.logoImage}/></Link>;
    return <div className={s.shell}><aside className={s.sidebar}>{logo}<nav aria-label={TERMS.navigation}>{nav.map((item, i) => { const Icon = icons[item.key]; return <div key={item.key}>{i === 1 && <p className={s.group}>{TERMS.categories}</p>}<Link className={s.navLink} href={item.href} aria-current={active === item.key ? 'page' : undefined}><Icon size={20} aria-hidden="true"/>{item.label}</Link></div>; })}</nav><Link className={`${s.navLink} ${s.help}`} href={`${base}/help`} aria-current={active === 'help' ? 'page' : undefined}><CircleHelp size={20} aria-hidden="true"/>{TERMS.help}</Link></aside><div className={s.body}><header className={s.top}><div className={s.mobileLogo}>{logo}</div><div className={s.desktopSearch}>{search()}</div><div className={s.topActions}><Link className={s.website} href="/" target="_blank" rel="noreferrer">{TERMS.viewWebsite} <span aria-hidden="true">&#8599;</span></Link><Menu ariaLabel={`${TERMS.account}: ${userEmail}`} icon={<UserRound size={20}/>} items={account}/></div></header><main className={s.main}>{children}</main></div><nav className={s.bottom} aria-label={TERMS.navigation}>{nav.map(item => { const Icon = icons[item.key]; return <Link key={item.key} href={item.href} aria-current={active === item.key ? 'page' : undefined}><Icon size={20} aria-hidden="true"/><span>{item.label}</span></Link>; })}<div className={s.more}><Menu ariaLabel={TERMS.more} icon={<MoreHorizontal size={20}/>} items={[{ label: TERMS.help, href: `${base}/help` }, { label: TERMS.viewWebsite, href: '/' }, { label: TERMS.search, onSelect: () => setSearchOpen(true) }]}/><span>{TERMS.more}</span></div></nav><Modal open={searchOpen} onOpenChange={setSearchOpen} title={TERMS.search}>{search()}</Modal></div>;
}
