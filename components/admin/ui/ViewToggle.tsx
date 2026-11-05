"use client";
import * as Tabs from '@radix-ui/react-tabs';
import { Grid2X2, List } from 'lucide-react';
import type { ReactNode } from 'react';
import { TERMS } from '@/lib/admin/taxonomy';
import s from './ViewToggle.module.css';
export function ViewToggle({ value, onValueChange, table, grid }: {
    value: 'table' | 'grid';
    onValueChange: (value: 'table' | 'grid') => void;
    table: ReactNode;
    grid: ReactNode;
}) { return <Tabs.Root value={value} onValueChange={v => onValueChange(v as 'table' | 'grid')}><Tabs.List className={s.list} aria-label={TERMS.preview}><Tabs.Trigger className={s.tab} value="table"><List size={18}/>{TERMS.table}</Tabs.Trigger><Tabs.Trigger className={s.tab} value="grid"><Grid2X2 size={18}/>{TERMS.grid}</Tabs.Trigger></Tabs.List><Tabs.Content value="table">{table}</Tabs.Content><Tabs.Content value="grid">{grid}</Tabs.Content></Tabs.Root>; }
