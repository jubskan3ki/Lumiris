import { Hero } from '@/features/hero';
import { IrisPillars } from '@/features/iris-pillars';
import { FeaturedPassports } from '@/features/featured-passports';
import { Personas } from '@/features/personas';
import { RegulatoryTimeline } from '@/features/regulatory-timeline';

export default function Home() {
    return (
        <>
            <Hero />
            <IrisPillars />
            <FeaturedPassports />
            <Personas />
            <RegulatoryTimeline />
        </>
    );
}
