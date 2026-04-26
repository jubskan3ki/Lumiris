import type { Metadata } from 'next';
import { JournalContent } from '@/features/journal-content';

export const metadata: Metadata = {
    title: 'Journal',
    description: 'The LUMIRIS Journal -- editorial coverage of EU regulations, audit stories, and greenwashing alerts.',
};

export default function JournalPage() {
    return <JournalContent />;
}
