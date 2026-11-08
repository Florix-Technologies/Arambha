import type { Metadata } from 'next';
import { adminFont } from '@/components/admin/font';
import { TERMS } from '@/lib/admin/taxonomy';
import '@/components/admin/tokens.css';

export const metadata: Metadata = { title: TERMS.adminTitle, robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
    return <div className={`adminRoot ${adminFont.variable}`}>{children}</div>;
}
