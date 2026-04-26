import type { Metadata } from 'next';
import { BusinessContent } from '@/features/business-content';

export const metadata: Metadata = {
    title: 'For Business',
    description:
        'LUMIRIS COMMAND -- the backend platform for brands to submit, audit, and improve product transparency data. Earn the Verified by LUMIRIS badge.',
};

export default function BusinessPage() {
    return <BusinessContent />;
}
