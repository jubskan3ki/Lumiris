import type { Metadata } from 'next';
import { MethodologyContent } from '@/features/methodology-content';

export const metadata: Metadata = {
    title: 'Methodology',
    description:
        'Understand the LUMIRIS Algorithm: the 50/30/20 scoring rule, the Iris Grade scale, and why missing data means automatic Grade E.',
};

export default function MethodologyPage() {
    return <MethodologyContent />;
}
