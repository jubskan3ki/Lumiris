'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Archive, Sparkles } from 'lucide-react';
import { IrisScanner } from '../iris-scanner';
import { DeepReveal } from '../deep-reveal';
import { Wardrobe } from '../wardrobe';
import { DiscoveryFeed } from '../discovery-feed';
import { type Product, SAMPLE_PRODUCT } from '@/lib/lumiris-data';

type Screen = 'scanner' | 'wardrobe' | 'discover';

export function AppShell() {
    const [activeScreen, setActiveScreen] = useState<Screen>('scanner');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleProductScanned = useCallback(() => {
        setSelectedProduct(SAMPLE_PRODUCT);
    }, []);

    const handleCloseProduct = useCallback(() => {
        setSelectedProduct(null);
    }, []);

    const handleSelectProduct = useCallback((product: Product) => {
        setSelectedProduct(product);
    }, []);

    return (
        <div className="bg-background relative mx-auto flex h-[100dvh] max-w-md flex-col overflow-hidden">
            {/* Main content */}
            <div className="relative flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {selectedProduct ? (
                        <motion.div
                            key={`product-${selectedProduct.id}`}
                            className="absolute inset-0"
                            layoutId={`product-card-${selectedProduct.id}`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                        >
                            <DeepReveal product={selectedProduct} onClose={handleCloseProduct} />
                        </motion.div>
                    ) : activeScreen === 'scanner' ? (
                        <motion.div
                            key="scanner"
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <IrisScanner onProductScanned={handleProductScanned} />
                        </motion.div>
                    ) : activeScreen === 'wardrobe' ? (
                        <motion.div
                            key="wardrobe"
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Wardrobe onSelectProduct={handleSelectProduct} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="discover"
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <DiscoveryFeed />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tab bar - Thumb Zone */}
            <AnimatePresence>
                {!selectedProduct && (
                    <motion.nav
                        className="border-border/40 bg-background/85 absolute bottom-0 left-0 right-0 z-50 border-t px-6 pb-7 pt-2 backdrop-blur-xl"
                        initial={{ y: 80 }}
                        animate={{ y: 0 }}
                        exit={{ y: 80 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    >
                        <div className="flex items-center justify-around">
                            <TabButton
                                icon={<Scan className="h-5 w-5" />}
                                label="Scan"
                                isActive={activeScreen === 'scanner'}
                                onClick={() => setActiveScreen('scanner')}
                            />
                            <TabButton
                                icon={<Archive className="h-5 w-5" />}
                                label="Vault"
                                isActive={activeScreen === 'wardrobe'}
                                onClick={() => setActiveScreen('wardrobe')}
                            />
                            <TabButton
                                icon={<Sparkles className="h-5 w-5" />}
                                label="Discover"
                                isActive={activeScreen === 'discover'}
                                onClick={() => setActiveScreen('discover')}
                            />
                        </div>
                    </motion.nav>
                )}
            </AnimatePresence>
        </div>
    );
}

function TabButton({
    icon,
    label,
    isActive,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`relative flex flex-col items-center gap-0.5 px-5 py-1.5 transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
            }`}
        >
            {icon}
            <span className="text-[10px] font-semibold tracking-wide">{label}</span>
            {isActive && (
                <motion.div
                    className="bg-foreground absolute -top-2 h-0.5 w-8 rounded-full"
                    layoutId="tab-indicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
            )}
        </button>
    );
}
