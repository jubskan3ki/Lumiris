'use client';

import { useCurrentArtisan } from '@/lib/current-artisan';
import { ScansSection } from './scans-section';
import { PerformanceSection } from './performance-section';
import { TopPassportsSection } from './top-passports-section';

export function Analytics() {
    const artisan = useCurrentArtisan();
    return (
        <div className="space-y-6 p-4 md:p-8">
            <ScansSection artisanId={artisan.id} />
            <PerformanceSection artisanId={artisan.id} />
            <TopPassportsSection artisanId={artisan.id} />
        </div>
    );
}
