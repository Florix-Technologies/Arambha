"use client";
import { useId, useRef, useEffect, type ReactNode } from 'react';
import { TERMS } from '@/lib/admin/taxonomy';
import s from './IndexTable.module.css';
export type IndexColumn<T> = {
    key: string;
    label: string;
    render: (row: T) => ReactNode;
};
export type IndexTableProps<T> = {
    columns: IndexColumn<T>[];
    rows: T[];
    rowKey: (row: T) => string;
    caption: string;
    selectable?: boolean;
    selectedKeys?: string[];
    onSelectionChange?: (keys: string[]) => void;
    bulkActions?: ReactNode;
};
export function IndexTable<T>({ columns, rows, rowKey, caption, selectable = false, selectedKeys = [], onSelectionChange, bulkActions }: IndexTableProps<T>) {
    const id = useId();
    const all = rows.length > 0 && rows.every(row => selectedKeys.includes(rowKey(row)));
    const some = rows.some(row => selectedKeys.includes(rowKey(row)));
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { if (ref.current)
        ref.current.indeterminate = some && !all; }, [some, all]);
    function toggle(key: string) { onSelectionChange?.(selectedKeys.includes(key) ? selectedKeys.filter(k => k !== key) : [...selectedKeys, key]); }
    return <div className={s.wrapper}>{selectable && <div className={s.selectionBar}><label className={s.check}><input ref={ref} type="checkbox" checked={all} disabled={!rows.length} aria-label={TERMS.selectAll} onChange={() => onSelectionChange?.(all ? selectedKeys.filter(key => !rows.some(row => rowKey(row) === key)) : Array.from(new Set([...selectedKeys, ...rows.map(rowKey)])))}/>{TERMS.selectAll}</label></div>}{selectable && some && <div className={s.bulk} role="region" aria-label={TERMS.bulkActions}><strong>{TERMS.bulkActions} ({selectedKeys.length})</strong>{bulkActions}</div>}<table className={s.table}><caption>{caption}</caption><thead><tr>{selectable && <th className={s.selection} scope="col"><span className={s.srOnly}>{TERMS.selectRow}</span></th>}{columns.map(col => <th key={col.key} scope="col">{col.label}</th>)}</tr></thead><tbody>{rows.map(row => { const key = rowKey(row); return <tr key={key}>{selectable && <td className={s.selection}><label className={s.check}><input type="checkbox" checked={selectedKeys.includes(key)} onChange={() => toggle(key)} aria-label={`${TERMS.selectRow} ${key}`} aria-describedby={`${id}-${key}`}/></label></td>}{columns.map((col, i) => <td key={col.key} data-label={col.label} id={i === 0 ? `${id}-${key}` : undefined}><div className={s.cell}>{col.render(row)}</div></td>)}</tr>; })}</tbody></table></div>;
}
