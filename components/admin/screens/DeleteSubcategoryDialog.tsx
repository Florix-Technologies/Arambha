"use client";
import { useState } from 'react';
import { Modal, Button, SelectField, TextField } from '../ui';
import { TERMS, MESSAGES } from '@/lib/admin/taxonomy';
import type { AdminSubcategory } from '@/lib/admin/types';
import s from './DeleteSubcategoryDialog.module.css';
export function DeleteSubcategoryDialog({ open, name, count, subcategories, onOpenChange, onConfirm }: {
    open: boolean;
    name: string;
    count: number;
    subcategories: AdminSubcategory[];
    onOpenChange?: (open: boolean) => void;
    onConfirm?: (target: string | null) => void;
}) {
    const [visible, setVisible] = useState(open);
    const [choice, setChoice] = useState('move');
    const [target, setTarget] = useState('');
    const [typed, setTyped] = useState('');
    const close = (value: boolean) => { setVisible(value); onOpenChange?.(value); };
    const valid = choice === 'move' ? !!target : typed === name;
    return <Modal open={visible} onOpenChange={close} title={MESSAGES.deleteConfirm(name)} description={MESSAGES.deleteHasProducts(count)}>
        <form className={s.form} onSubmit={e => {
            e.preventDefault(); if (valid) {
                onConfirm?.(choice === 'move' ? target : null);
                close(false);
            }
        }}>
            <fieldset className={s.options}>
                <label className={s.radio}>
                    <input type="radio" name="delete-choice" value="move" checked={choice === 'move'} onChange={() => setChoice('move')} />
                    {MESSAGES.moveProducts(count, '')}
                </label>
                {choice === 'move' &&
                    <SelectField label={TERMS.subcategory} required value={target} onChange={e => setTarget(e.target.value)}>
                        <option value="">
                            {TERMS.chooseSubcategory}
                        </option>
                        {subcategories.filter(x => x.name !== name).map(x =>
                            <option value={x.id} key={x.id}>
                                {x.name}
                            </option>
                        )}
                    </SelectField>
                }
                <label className={s.radio}>
                    <input type="radio" name="delete-choice" value="delete" checked={choice === 'delete'} onChange={() => setChoice('delete')} />
                    {MESSAGES.deleteWithProducts(count)}
                </label>
                {choice === 'delete' &&
                    <TextField label={MESSAGES.typeToConfirm(name)} value={typed} autoComplete="off" onChange={e => setTyped(e.target.value)} />
                }
            </fieldset>
            <div className={s.actions}>
                <Button variant="secondary" onClick={() => close(false)}>
                    {TERMS.cancel}
                </Button>
                <Button type="submit" variant="destructive" disabled={!valid}>
                    {TERMS.delete}
                </Button>
            </div>
        </form>
    </Modal>;
}
