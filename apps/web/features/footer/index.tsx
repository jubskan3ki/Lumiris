'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const footerLinks = [
    {
        title: 'Platform',
        links: [
            { label: 'Mission', href: '/' },
            { label: 'Methodology', href: '/methodology' },
            { label: 'Journal', href: '/journal' },
            { label: 'Download App', href: '#' },
        ],
    },
    {
        title: 'For Brands',
        links: [
            { label: 'LUMIRIS COMMAND', href: '/business' },
            { label: 'Audit Pipeline', href: '/business' },
            { label: 'Request a Demo', href: '/business' },
            { label: 'Case Studies', href: '/journal' },
        ],
    },
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Press Kit', href: '#' },
            { label: 'Contact', href: '#' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Cookie Policy', href: '#' },
            { label: 'GDPR', href: '#' },
        ],
    },
];

export function Footer() {
    return (
        <footer className="border-border bg-card relative border-t">
            <div className="mx-auto max-w-6xl px-6 py-14">
                <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:max-w-xs"
                    >
                        <Link href="/" className="mb-4 flex items-center gap-2">
                            <div className="relative h-7 w-7">
                                <div className="prismatic-bg absolute inset-0 rounded-lg opacity-90" />
                                <div className="bg-card absolute inset-[2.5px] flex items-center justify-center rounded-[5px]">
                                    <span className="text-foreground font-mono text-[10px] font-bold">L</span>
                                </div>
                            </div>
                            <span className="text-foreground text-base font-semibold tracking-tight">LUMIRIS</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Seeing through the opaque. Independent product transparency scoring for a more honest world.
                        </p>
                    </motion.div>

                    <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
                        {footerLinks.map((group, i) => (
                            <motion.div
                                key={group.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.08 }}
                            >
                                <h4 className="text-foreground mb-4 text-xs font-semibold uppercase tracking-wide">
                                    {group.title}
                                </h4>
                                <ul className="flex flex-col gap-2.5">
                                    {group.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="border-border mt-14 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
                    <p className="text-muted-foreground text-xs">2026 LUMIRIS. All rights reserved.</p>
                    <p className="text-muted-foreground text-xs">Built with radical transparency.</p>
                </div>
            </div>
        </footer>
    );
}
