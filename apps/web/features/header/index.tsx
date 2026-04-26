'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Download } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { label: 'Mission', href: '/' },
    { label: 'Methodology', href: '/methodology' },
    { label: 'Journal', href: '/journal' },
    { label: 'For Business', href: '/business' },
];

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2 rounded-2xl transition-all duration-500 ${
                scrolled ? 'glass shadow-foreground/[0.03] shadow-lg' : 'bg-card/40 backdrop-blur-sm'
            }`}
        >
            <nav className="flex items-center justify-between px-6 py-3">
                {/* Logo */}
                <Link href="/" className="group flex items-center gap-2.5">
                    <div className="relative h-7 w-7">
                        <div className="prismatic-bg absolute inset-0 rounded-lg opacity-90" />
                        <div className="bg-card absolute inset-[2.5px] flex items-center justify-center rounded-[5px]">
                            <span className="text-foreground font-mono text-[10px] font-bold">L</span>
                        </div>
                    </div>
                    <span className="text-foreground text-base font-semibold tracking-tight">LUMIRIS</span>
                </Link>

                {/* Desktop nav */}
                <ul className="hidden items-center gap-1 md:flex">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`relative rounded-lg px-3.5 py-1.5 text-sm transition-colors duration-200 ${
                                        isActive
                                            ? 'text-foreground font-medium'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {link.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="bg-secondary absolute inset-0 rounded-lg"
                                            style={{ zIndex: -1 }}
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                        />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* CTA */}
                <div className="hidden items-center gap-3 md:flex">
                    <Link
                        href="#"
                        className="bg-grade-a text-card inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Download App
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="text-foreground md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden md:hidden"
                    >
                        <div className="flex flex-col gap-1 px-6 pb-6">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                                            isActive
                                                ? 'text-foreground bg-secondary font-medium'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                            <div className="border-border mt-2 border-t pt-3">
                                <Link
                                    href="#"
                                    className="bg-grade-a text-card inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Download App
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
