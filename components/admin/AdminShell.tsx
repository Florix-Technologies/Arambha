"use client";
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image';
import { useEffect, useState, type ReactNode } from 'react';
import { LayoutDashboard, Armchair, House, Images, MoreHorizontal, CircleHelp, UserRound, Search, Menu as MenuIcon, X } from 'lucide-react';
import { CATEGORIES, CATEGORY_KEYS, TERMS, type CategoryKey } from '@/lib/admin/taxonomy';
import { Menu, type MenuItem } from './ui/Menu';
import { Modal } from './ui/Modal';
import s from './AdminShell.module.css';
import { adminFont } from './font';
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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    useEffect(() => {
        const desktop = window.matchMedia('(min-width:768px)');
        const closeOnDesktop = () => { if (desktop.matches) setDrawerOpen(false); };
        desktop.addEventListener('change', closeOnDesktop);
        return () => desktop.removeEventListener('change', closeOnDesktop);
    }, []);
    const base = basePath.replace(/\/$/, '');
    const account: MenuItem[] = [{ label: TERMS.email + ': ' + userEmail, disabled: true }, { label: onChangePassword ? TERMS.changePassword : TERMS.changePasswordClassic, href: onChangePassword ? undefined : '/admin', onSelect: onChangePassword }, { label: TERMS.logOut, href: onLogOut ? undefined : '/admin', onSelect: onLogOut }];
    const nav = [{ key: 'dashboard' as const, label: TERMS.dashboard, href: base }, ...CATEGORY_KEYS.map(key => ({ key, label: CATEGORIES[key].label, href: `${base}/${key}` }))];
    const search = () => onSearch && <form className={s.search} onSubmit={onSearch ? e => { e.preventDefault(); const data = new FormData(e.currentTarget); onSearch(String(data.get('q') ?? '')); } : undefined}>
        <Search size={18} aria-hidden="true"/>
        <input type="search" name="q" placeholder={TERMS.search} aria-label={TERMS.search}/>
        </form>;
    const logo = <Link href={base} className={s.logo} onClick={() => setDrawerOpen(false)} aria-label={TERMS.dashboard}>
        <Image src="/logo2.png" alt={TERMS.brand} width={140} height={48} className={s.logoImage}/>
        </Link>;
    return <div className={s.shell}>
        <a className={s.skip} href="#admin-main">{TERMS.adminTitle}</a>
        <aside className={s.sidebar}>{logo}<nav aria-label={TERMS.navigation}>{nav.map((item, i) => { const Icon = icons[item.key]; return <div key={item.key}>{i === 1 && <p className={s.group}>{TERMS.categories}</p>}<Link className={s.navLink} href={item.href} aria-current={active === item.key ? 'page' : undefined}>
        <Icon size={20} aria-hidden="true"/>{item.label}</Link>
        </div>; })}</nav>
        <Link className={`${s.navLink} ${s.help}`} href="/admin" aria-current={active === 'help' ? 'page' : undefined}>
        <CircleHelp size={20} aria-hidden="true"/>{TERMS.helpClassic}</Link>
        </aside>
        <div className={s.body}>
        <header className={s.top}>
        <div className={s.mobileLogo}>
        <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Trigger type="button" className={s.drawerButton} aria-label={TERMS.navigation}>
        <MenuIcon size={20} aria-hidden="true"/>
        </Dialog.Trigger>
        <Dialog.Portal>
        <Dialog.Overlay className={`adminRoot ${adminFont.variable} ${s.drawerOverlay}`}/>
        <Dialog.Content className={`adminRoot ${adminFont.variable} ${s.drawer}`} aria-describedby={undefined} onCloseAutoFocus={event => {
            if (window.matchMedia('(min-width:768px)').matches) {
                event.preventDefault();
                document.getElementById('admin-main')?.focus();
            }
        }}>
        <div className={s.drawerHeader}>
        <Dialog.Title>{TERMS.navigation}</Dialog.Title>
        <Dialog.Close type="button" className={s.drawerButton} aria-label={TERMS.close}>
        <X size={20} aria-hidden="true"/>
        </Dialog.Close>
        </div>{logo}<nav aria-label={TERMS.navigation}>{nav.map(item => { const Icon = icons[item.key]; return <Link key={item.key} className={s.navLink} href={item.href} aria-current={active === item.key ? 'page' : undefined} onClick={() => setDrawerOpen(false)}>
        <Icon size={20} aria-hidden="true"/>{item.label}</Link>; })}<Link className={s.navLink} href="/admin" aria-current={active === 'help' ? 'page' : undefined} onClick={() => setDrawerOpen(false)}>{TERMS.helpClassic}</Link>
        </nav>
        </Dialog.Content>
        </Dialog.Portal>
        </Dialog.Root>{logo}</div>
        <div className={s.desktopSearch}>{search()}</div>
        <div className={s.topActions}>
        <Link className={s.website} href="/" target="_blank" rel="noreferrer">{TERMS.viewWebsite} <span aria-hidden="true">&#8599;</span>
        </Link>
        <Menu ariaLabel={`${TERMS.account}: ${userEmail}`} icon={<UserRound size={20}/>} items={account}/>
        </div>
        </header>
        <main id="admin-main" tabIndex={-1} className={s.main}>{children}</main>
        </div>
        <nav className={s.bottom} aria-label={TERMS.navigation}>{nav.map(item => { const Icon = icons[item.key]; return <Link key={item.key} href={item.href} aria-current={active === item.key ? 'page' : undefined}>
        <Icon size={20} aria-hidden="true"/>
        <span>{item.label}</span>
        </Link>; })}<div className={s.more}>
        <Menu ariaLabel={TERMS.more} icon={<MoreHorizontal size={20}/>} items={[{ label: TERMS.helpClassic, href: '/admin' }, { label: TERMS.viewWebsite, href: '/' }, ...(onSearch ? [{ label: TERMS.search, onSelect: () => setSearchOpen(true) }] : [])]}/>
        <span>{TERMS.more}</span>
        </div>
        </nav>
        <Modal open={searchOpen} onOpenChange={setSearchOpen} title={TERMS.search}>{search()}</Modal>
        </div>;
}
