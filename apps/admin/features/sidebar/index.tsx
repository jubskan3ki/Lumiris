'use client';

import { memo } from 'react';
import { LayoutDashboard, Factory, ShieldCheck, BookOpen, MessageSquare, FileText } from 'lucide-react';
import { cn } from '@lumiris/ui/lib/cn';

export type NavSection = 'overview' | 'audit-factory' | 'certificates' | 'journal' | 'feedback';

interface SidebarProps {
    activeSection: NavSection;
    onNavigate: (section: NavSection) => void;
}

const navItems: {
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'audit-factory', label: 'Audit Factory', icon: Factory },
    { id: 'certificates', label: 'Certificate Vault', icon: ShieldCheck },
    { id: 'journal', label: 'LUMIRIS Journal', icon: BookOpen },
    { id: 'feedback', label: 'User Feedback', icon: MessageSquare },
];

function SidebarComponent({ activeSection, onNavigate }: SidebarProps) {
    return (
        <aside className="border-border bg-card fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r">
            {/* Logo */}
            <div className="flex items-center gap-3 px-5 py-6">
                <div className="bg-lumiris-emerald flex h-8 w-8 items-center justify-center rounded-lg">
                    <div className="bg-primary-foreground h-3 w-3 rounded-sm" />
                </div>
                <div>
                    <h1 className="text-foreground text-sm font-semibold tracking-wide">LUMIRIS</h1>
                    <p className="text-muted-foreground font-mono text-[10px] tracking-widest">PLATFORM</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2">
                <div className="space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={cn(
                                    'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                                    isActive
                                        ? 'bg-lumiris-emerald/8 text-lumiris-emerald font-medium'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                {/* Active indicator — solid emerald left border */}
                                {isActive && (
                                    <span className="bg-lumiris-emerald absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full" />
                                )}
                                <item.icon
                                    className={cn(
                                        'h-[18px] w-[18px]',
                                        isActive ? 'text-lumiris-emerald' : 'text-muted-foreground',
                                    )}
                                />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="border-border border-t px-4 py-3">
                <div className="flex items-center gap-2">
                    <FileText className="text-muted-foreground/50 h-3.5 w-3.5" />
                    <span className="text-muted-foreground/50 font-mono text-[10px]">ESPR-2024 v2.1</span>
                </div>
            </div>
        </aside>
    );
}

export const Sidebar = memo(SidebarComponent);
