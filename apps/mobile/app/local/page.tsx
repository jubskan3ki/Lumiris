import { mockArtisansWithSlug, mockRepairers } from '@lumiris/mock-data';
import { LocalHub } from '@/features/local-hub';

export const dynamicParams = false;

export default function LocalPage() {
    return <LocalHub artisans={mockArtisansWithSlug} repairers={mockRepairers} />;
}
