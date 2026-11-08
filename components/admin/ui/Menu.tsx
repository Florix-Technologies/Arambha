"use client";
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { adminFont } from '../font';
import s from './Menu.module.css';
export type MenuItem = {
    label: string;
    href?: string;
    onSelect?: () => void;
    disabled?: boolean;
    destructive?: boolean;
};
export function Menu({ items, ariaLabel, icon, children }: {
    items?: MenuItem[];
    ariaLabel: string;
    icon?: ReactNode;
    children?: ReactNode;
}) {
    return <Dropdown.Root><Dropdown.Trigger type="button" className={s.trigger} aria-label={ariaLabel}>{icon ?? <MoreHorizontal size={20}/>}</Dropdown.Trigger><Dropdown.Portal><Dropdown.Content loop aria-label={ariaLabel} className={`adminRoot ${adminFont.variable} ${s.content}`} sideOffset={8} collisionPadding={8}>{items?.map((item, i) => <Dropdown.Item key={i} disabled={item.disabled} onSelect={item.onSelect} className={`${s.item} ${item.destructive ? s.danger : ''}`} asChild={!!item.href && !item.disabled}>{item.href && !item.disabled ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}</Dropdown.Item>)}{children}</Dropdown.Content></Dropdown.Portal></Dropdown.Root>;
}
