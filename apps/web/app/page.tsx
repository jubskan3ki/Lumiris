import { Hero } from '@/features/hero';
import { PillarsPreview } from '@/features/pillars-preview';
import { RecentScans } from '@/features/recent-scans';

export default function Home() {
    return (
        <>
            <Hero />
            <PillarsPreview />
            <RecentScans />
        </>
    );
}
