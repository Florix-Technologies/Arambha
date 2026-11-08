import { HELP_GUIDES } from '@/lib/helpContent';
import { TERMS } from '@/lib/admin/taxonomy';
import { Card, PageHeader } from '../ui';
import s from './SettingsScreen.module.css';

export function HelpScreen() {
    return <div className={s.page}>
        <PageHeader breadcrumbs={[{ label: TERMS.dashboard, href: '/admin' }, { label: TERMS.help }]} title={TERMS.help} subtitle="Short guides for everyday tasks." />
        <Card>
            <div className={s.guides}>
                {HELP_GUIDES.map((guide, i) => <details key={guide.id} open={i === 0}>
                    <summary>{guide.title}</summary>
                    <ol>{guide.steps.map(step => <li key={step}>{step}</li>)}</ol>
                </details>)}
            </div>
        </Card>
    </div>;
}
