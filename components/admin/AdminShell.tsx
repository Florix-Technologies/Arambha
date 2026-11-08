"use client";
import Link from 'next/link';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { LayoutDashboard, Armchair, House, Frame, Images, Settings, CircleHelp, MoreHorizontal, UserRound, ExternalLink } from 'lucide-react';
import { CATEGORIES, CATEGORY_KEYS, TERMS, type CategoryKey } from '@/lib/admin/taxonomy';
import { Menu, type MenuItem } from './ui/Menu';
import s from './AdminShell.module.css';

export type ActiveKey = 'dashboard' | CategoryKey | 'media' | 'settings' | 'help' | null;
const BASE = '/admin';
const categoryIcons = { furniture: Armchair, interiors: House, gallery: Frame };
type Item = { key: Exclude<ActiveKey, null>; label: string; href: string; Icon: typeof Settings };
const catalog: Item[] = CATEGORY_KEYS.map(key => ({ key, label: CATEGORIES[key].label, href: `${BASE}/${key}`, Icon: categoryIcons[key] }));
const overview: Item = { key: 'dashboard', label: TERMS.dashboard, href: BASE, Icon: LayoutDashboard };
const media: Item = { key: 'media', label: TERMS.mediaLibrary, href: `${BASE}/media`, Icon: Images };
const footer: Item[] = [
    { key: 'settings', label: TERMS.settings, href: `${BASE}/settings`, Icon: Settings },
    { key: 'help', label: TERMS.help, href: `${BASE}/help`, Icon: CircleHelp },
];

export function AdminShell({ active, userEmail, children, onLogOut }: {
    active: ActiveKey;
    userEmail: string;
    children: ReactNode;
    onLogOut: () => void;
}) {
    const link = ({ key, label, href, Icon }: Item) => <Link key={key} className={s.navLink} href={href} data-tour={`nav-${key}`} aria-current={active === key ? 'page' : undefined}>
        <Icon size={20} aria-hidden="true" />{label}</Link>;
    const brand = <Link href={BASE} className={s.brand} aria-label={`${TERMS.brand} ${TERMS.dashboard}`}>
        <Image src="/admin-mark.png" alt="" width={40} height={40} className={s.mark} priority />
        <span className={s.wordmark}>{TERMS.brand}<small>Admin</small></span>
    </Link>;
    const account: MenuItem[] = [
        { label: userEmail, disabled: true },
        { label: TERMS.settings, href: `${BASE}/settings` },
        { label: TERMS.logOut, onSelect: onLogOut },
    ];
    return <div className={s.shell}>
        <a className={s.skip} href="#admin-main">Skip to content</a>
        <aside className={s.sidebar}>
            {brand}
            <nav aria-label={TERMS.navigation} className={s.nav}>
                {link(overview)}
                <p className={s.group} id="nav-catalog">{TERMS.catalog}</p>
                <div role="group" aria-labelledby="nav-catalog">{catalog.map(link)}</div>
                {link(media)}
                <div className={s.footer}>{footer.map(link)}</div>
            </nav>
        </aside>
        <div className={s.body}>
            <header className={s.top}>
                <div className={s.mobileBrand}>{brand}</div>
                <div className={s.topActions}>
                    <Link className={s.help} href={`${BASE}/help`} aria-label="Help and guided tour" data-tour="help"><CircleHelp size={20} aria-hidden="true" />{TERMS.help}</Link>
                    <a className={s.website} href="/" target="_blank" rel="noreferrer">{TERMS.viewWebsite}<ExternalLink size={16} aria-hidden="true" /></a>
                    <Menu ariaLabel={`${TERMS.account}: ${userEmail}`} icon={<UserRound size={20} />} items={account} />
                </div>
            </header>
            <main id="admin-main" tabIndex={-1} className={s.main}>{children}</main>
        </div>
        <nav className={s.bottom} aria-label={TERMS.navigation}>
            {[overview, ...catalog].map(({ key, label, href, Icon }) => <Link key={key} href={href} data-tour={`nav-${key}`} aria-current={active === key ? 'page' : undefined}>
                <Icon size={20} aria-hidden="true" /><span>{label}</span>
            </Link>)}
            <div className={s.more} data-active={active === 'media' || active === 'settings' || active === 'help' || undefined}>
                <Menu ariaLabel={TERMS.more} icon={<MoreHorizontal size={20} />} items={[
                    { label: TERMS.mediaLibrary, href: media.href },
                    ...footer.map(item => ({ label: item.label, href: item.href })),
                    { label: TERMS.viewWebsite, href: '/' },
                ]} />
                <span>{TERMS.more}</span>
            </div>
        </nav>
    </div>;
}
