"use client";
import { usePathname } from 'next/navigation';
import { AdminShell } from './AdminShell';
import { ToastProvider } from './ui';
import { SAMPLE } from '@/lib/admin/mockData';
export function PreviewShell({ children }: {
    children: React.ReactNode;
}) {
    const path = usePathname();
    const active = path.includes('/gallery') ? 'gallery' : path.includes('/interiors') || path.includes('/products') ? 'interiors' : path.includes('/furniture') ? 'furniture' : 'dashboard';
    return <ToastProvider>
        <AdminShell basePath="/admin-preview" active={active} userEmail={SAMPLE.ownerEmail}>
            {children}
        </AdminShell>
    </ToastProvider>;
}
