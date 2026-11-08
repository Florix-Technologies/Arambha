"use client";
import { useId, useRef, useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
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
    const [activeCell, setActiveCell] = useState({ row: 0, column: 0 });
    function navigate(event: KeyboardEvent<HTMLTableCellElement>, row: number, column: number) {
        // Embedded controls retain their native keys (notably inputs and menus).
        if (event.target !== event.currentTarget || event.altKey || event.metaKey) return;
        const lastColumn = columns.length - 1 + Number(selectable);
        let nextRow = row, nextColumn = column;
        switch (event.key) {
            case 'ArrowDown': nextRow = Math.min(rows.length - 1, row + 1); break;
            case 'ArrowUp': nextRow = Math.max(0, row - 1); break;
            case 'ArrowRight': nextColumn = Math.min(lastColumn, column + 1); break;
            case 'ArrowLeft': nextColumn = Math.max(0, column - 1); break;
            case 'Home': nextColumn = 0; if (event.ctrlKey) nextRow = 0; break;
            case 'End': nextColumn = lastColumn; if (event.ctrlKey) nextRow = rows.length - 1; break;
            default: return;
        }
        event.preventDefault();
        const table = event.currentTarget.closest('table');
        table?.tBodies[0]?.rows[nextRow]?.cells[nextColumn]?.focus();
    }
    function cellProps(row: number, column: number) {
        return {
            tabIndex: Math.min(activeCell.row, rows.length - 1) === row && Math.min(activeCell.column, columns.length - 1 + Number(selectable)) === column ? 0 : -1,
            onFocus: () => setActiveCell({ row, column }),
            onKeyDown: (event: KeyboardEvent<HTMLTableCellElement>) => navigate(event, row, column),
        };
    }
    const all = rows.length > 0 && rows.every(row => selectedKeys.includes(rowKey(row)));
    const some = rows.some(row => selectedKeys.includes(rowKey(row)));
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { if (ref.current)
        ref.current.indeterminate = some && !all; }, [some, all]);
    function toggle(key: string) { onSelectionChange?.(selectedKeys.includes(key) ? selectedKeys.filter(k => k !== key) : [...selectedKeys, key]); }
    return <div className={s.wrapper}>{selectable && <div className={s.selectionBar}><label className={s.check}><input ref={ref} type="checkbox" checked={all} disabled={!rows.length} aria-label={TERMS.selectAll} onChange={() => onSelectionChange?.(all ? selectedKeys.filter(key => !rows.some(row => rowKey(row) === key)) : Array.from(new Set([...selectedKeys, ...rows.map(rowKey)])))}/>{TERMS.selectAll}</label></div>}{selectable && some && <div className={s.bulk} role="region" aria-label={TERMS.bulkActions}><strong>{TERMS.bulkActions} ({selectedKeys.length})</strong>{bulkActions}</div>}<table role="table" className={s.table}><caption className={s.srOnly}>{caption}</caption><thead role="rowgroup"><tr role="row">{selectable && <th role="columnheader" className={s.selection} scope="col"><span className={s.srOnly}>{TERMS.selectRow}</span></th>}{columns.map(col => <th role="columnheader" key={col.key} scope="col">{col.label}</th>)}</tr></thead><tbody role="rowgroup">{rows.map((row, rowIndex) => { const key = rowKey(row); return <tr role="row" key={key}>{selectable && <td role="cell" {...cellProps(rowIndex, 0)} className={s.selection}><label className={s.check}><input type="checkbox" checked={selectedKeys.includes(key)} onChange={() => toggle(key)} aria-label={`${TERMS.selectRow} ${key}`} aria-describedby={`${id}-${key}`}/></label></td>}{columns.map((col, i) => <td role="cell" {...cellProps(rowIndex, i + Number(selectable))} key={col.key} data-label={col.label} id={i === 0 ? `${id}-${key}` : undefined}><div className={s.cell}>{col.render(row)}</div></td>)}</tr>; })}</tbody></table></div>;
}
