import type { Metadata } from 'next';
import { adminFont } from '@/components/admin/font';
import '@/components/admin/tokens.css';
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function AdminLayout({ children }: {
    children: React.ReactNode;
}) {
    return <div className={`adminRoot ${adminFont.variable}`}>{children}</div>;
}
