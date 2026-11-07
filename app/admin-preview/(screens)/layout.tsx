import { PreviewShell } from '@/components/admin/PreviewShell';
export default function Layout({ children }: {
    children: React.ReactNode;
}) {
    return <PreviewShell>
        {children}
    </PreviewShell>;
}
