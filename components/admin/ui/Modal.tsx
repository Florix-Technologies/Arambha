"use client";
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { TERMS } from '@/lib/admin/taxonomy';
import { adminFont } from '../font';
import s from './Modal.module.css';
export function Modal({ open, onOpenChange, title, description, children }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
}) { return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Portal><Dialog.Overlay className={`adminRoot ${adminFont.variable} ${s.overlay}`}/><Dialog.Content className={`adminRoot ${adminFont.variable} ${s.content}`} {...(!description ? { 'aria-describedby': undefined } : {})}><div className={s.header}><Dialog.Title>{title}</Dialog.Title><Dialog.Close className={s.close} aria-label={TERMS.close}><X size={20}/></Dialog.Close></div>{description && <Dialog.Description className={s.description}>{description}</Dialog.Description>}{children}</Dialog.Content></Dialog.Portal></Dialog.Root>; }
