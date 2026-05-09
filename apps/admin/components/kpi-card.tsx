import { cn } from '@lumiris/ui/lib/cn';

interface KpiCardProps {
    label: string;
    value: string;
    sub?: string;
    icon: React.ReactNode;
    tone: string;
}

export function KpiCard({ label, value, sub, icon, tone }: KpiCardProps) {
    return (
        <div className="border-border bg-card flex flex-col rounded-xl border p-4">
            <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider">{label}</p>
                <span className={cn('opacity-70', tone)}>{icon}</span>
            </div>
            <p className={cn('mt-1 font-mono text-2xl font-bold', tone)}>{value}</p>
            {sub ? <p className="text-muted-foreground mt-0.5 text-[11px]">{sub}</p> : null}
        </div>
    );
}
