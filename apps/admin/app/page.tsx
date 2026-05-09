'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { AdminUserProvider, AuditLogProvider } from '@/lib/auth';
import { Sidebar, type NavSection } from '@/features/sidebar';
import { TopBar } from '@/features/top-bar';
import { Overview } from '@/features/overview';
import { Passports } from '@/features/passports';
import { Artisans } from '@/features/artisans';
import { Repairers } from '@/features/retoucheurs';
import { VisionUsers } from '@/features/vision-users';
import { Billing } from '@/features/billing';
import { Affiliation } from '@/features/affiliation';
import { IrisWorkbench } from '@/features/iris-workbench';
import { Blog } from '@/features/blog';
import { Governance } from '@/features/governance';

const pageVariants: Variants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

function renderSection(section: NavSection) {
    switch (section) {
        case 'overview':
            return <Overview />;
        case 'passports':
            return <Passports />;
        case 'artisans':
            return <Artisans />;
        case 'retoucheurs':
            return <Repairers />;
        case 'vision-users':
            return <VisionUsers />;
        case 'billing':
            return <Billing />;
        case 'affiliation':
            return <Affiliation />;
        case 'iris-workbench':
            return <IrisWorkbench />;
        case 'blog':
            return <Blog />;
        case 'governance':
            return <Governance />;
    }
}

export default function LumirisCommand() {
    const [activeSection, setActiveSection] = useState<NavSection>('overview');
    const handleNavigate = useCallback((section: NavSection) => setActiveSection(section), []);

    return (
        <AdminUserProvider>
            <AuditLogProvider>
                <div className="bg-background min-h-screen">
                    <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
                    <TopBar onNavigate={handleNavigate} />
                    <main className="ml-60 pt-14">
                        <div className="p-6 lg:p-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSection}
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                >
                                    {renderSection(activeSection)}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>
                </div>
            </AuditLogProvider>
        </AdminUserProvider>
    );
}
