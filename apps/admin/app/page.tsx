'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar, type NavSection } from '@/features/sidebar';
import { TopBar } from '@/features/top-bar';
import { Overview } from '@/features/overview';
import { AuditFactory } from '@/features/audit-factory';
import { CertificateVault } from '@/features/certificate-vault';
import { Journal } from '@/features/journal';
import { AuditLogView } from '@/features/audit-log-view';

const pageVariants = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
};

export default function LumirisCommand() {
    const [activeSection, setActiveSection] = useState<NavSection>('overview');

    const handleNavigate = useCallback((section: NavSection) => {
        setActiveSection(section);
    }, []);

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return <Overview />;
            case 'audit-factory':
                return <AuditFactory />;
            case 'certificates':
                return <CertificateVault />;
            case 'journal':
                return <Journal />;
            case 'feedback':
                return <AuditLogView />;
            default:
                return <Overview />;
        }
    };

    return (
        <div className="bg-background min-h-screen">
            <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
            <TopBar onNavigate={handleNavigate} />

            {/* Main Content */}
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
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
