"use client";
import * as Toast from '@radix-ui/react-toast';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { TERMS } from '@/lib/admin/taxonomy';
import { adminFont } from '../font';
import s from './ToastProvider.module.css';
type Notice = {
    title: string;
    description?: string;
    action?: {
        label: string;
        href: string;
    };
};
const Context = createContext<((notice: Notice) => void) | null>(null);
export function ToastProvider({ children }: {
    children: ReactNode;
}) {
    const [notices, setNotices] = useState<(Notice & {
        id: number;
    })[]>([]);
    const toast = useCallback((notice: Notice) => setNotices(previous => [...previous, { ...notice, id: Date.now() + Math.random() }]), []);
    return <Context.Provider value={toast}><Toast.Provider swipeDirection="right">{children}{notices.map(notice => <Toast.Root className={s.toast} key={notice.id} onOpenChange={open => { if (!open)
        setNotices(previous => previous.filter(n => n.id !== notice.id)); }}><Toast.Title className={s.title}>{notice.title}</Toast.Title>{notice.description && <Toast.Description>{notice.description}</Toast.Description>}{notice.action && <Toast.Action asChild altText={notice.action.label}><Link className={s.action} href={notice.action.href}>{notice.action.label}</Link></Toast.Action>}<Toast.Close className={s.close} aria-label={TERMS.close}><X size={18}/></Toast.Close></Toast.Root>)}<Toast.Viewport className={`adminRoot ${adminFont.variable} ${s.viewport}`} aria-label={TERMS.notifications} aria-live="polite"/></Toast.Provider></Context.Provider>;
}
export function useToast() { const toast = useContext(Context); if (!toast)
    throw new Error('useToast requires ToastProvider'); return toast; }
