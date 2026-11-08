"use client";
import { CircleHelp } from 'lucide-react';
import { HELP_GUIDES } from '@/lib/helpContent';
import { TERMS } from '@/lib/admin/taxonomy';
import { Button, Card, PageHeader } from '../ui';
import { useTour } from '../Tour';
import s from './SettingsScreen.module.css';

export function HelpScreen() {
    const { start } = useTour();
    return <div className={s.page}>
        <PageHeader breadcrumbs={[{ label: TERMS.dashboard, href: '/admin' }, { label: TERMS.help }]} title={TERMS.help} subtitle="Short guides for everyday tasks."
            primaryAction={<Button onClick={start}><CircleHelp size={18} aria-hidden="true" />Take a tour</Button>} />
        <Card title="Guided tour">
            <p>A 9-step walk through the real pages: open a category, add a subcategory and a product, choose its cover, edit, move or delete it. You can stop at any time and start again here.</p>
            <Button onClick={start}>Take a tour</Button>
        </Card>
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
