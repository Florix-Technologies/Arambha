"use client";
import * as Primitive from '@radix-ui/react-tooltip';
import type { ReactElement } from 'react';
import { adminFont } from '../font';
import s from './Tooltip.module.css';
export function Tooltip({ text, children }: {
    text: string;
    children: ReactElement;
}) { return <Primitive.Provider delayDuration={300}><Primitive.Root><Primitive.Trigger asChild className={s.trigger}>{children}</Primitive.Trigger><Primitive.Portal><Primitive.Content className={`adminRoot ${adminFont.variable} ${s.content}`} sideOffset={8} collisionPadding={8}>{text}<Primitive.Arrow className={s.arrow}/></Primitive.Content></Primitive.Portal></Primitive.Root></Primitive.Provider>; }
