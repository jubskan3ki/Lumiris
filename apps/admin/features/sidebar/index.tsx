'use client';

import { memo } from 'react';
import {
    BarChart3,
    BookOpen,
    Coins,
    FileText,
    Gavel,
    LayoutDashboard,
    Scissors,
    ScrollText,
    Sparkles,
    Store,
    Users,
} from 'lucide-react';
import type { AdminAction } from '@lumiris/types';
import { cn } from '@lumiris/ui/lib/cn';
import { useCurrentUser } from '@/lib/auth';
import { can } from '@/lib/auth/permissions';

export type NavSection =
    | 'overview'
    | 'passports'
    | 'artisans'
    | 'retoucheurs'
    | 'vision-users'
    | 'billing'
    | 'affiliation'
    | 'iris-workbench'
    | 'blog'
    | 'governance';

interface NavItem {
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    requires: AdminAction;
}

const NAV_ITEMS: readonly NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, requires: 'governance.read_audit_log' },
    { id: 'passports', label: 'Passports', icon: FileText, requires: 'passport.read' },
    { id: 'artisans', label: 'Artisans', icon: Store, requires: 'artisan.read' },
    { id: 'retoucheurs', label: 'Repairers', icon: Scissors, requires: 'retoucheur.read' },
    { id: 'vision-users', label: 'Vision Users', icon: Users, requires: 'vision_user.read' },
    { id: 'billing', label: 'Billing', icon: Coins, requires: 'billing.read' },
    { id: 'affiliation', label: 'Affiliation', icon: BarChart3, requires: 'affiliation.read' },
    { id: 'iris-workbench', label: 'Iris Workbench', icon: Sparkles, requires: 'passport.read' },
    { id: 'blog', label: 'Blog', icon: BookOpen, requires: 'blog.read' },
    { id: 'governance', label: 'Governance', icon: Gavel, requires: 'governance.read_audit_log' },
];

interface SidebarProps {
    activeSection: NavSection;
    onNavigate: (section: NavSection) => void;
}

function SidebarComponent({ activeSection, onNavigate }: SidebarProps) {
    const user = useCurrentUser();
    // Overview is always visible — every back-office role lands somewhere; the placeholder gates inner content.
    const visibleItems = NAV_ITEMS.filter((item) => item.id === 'overview' || can(user.role, item.requires));

    return (
        <aside className="border-border bg-card fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r">
            <div className="flex items-center gap-3 px-5 py-6">
                <div className="bg-lumiris-emerald flex h-8 w-8 items-center justify-center rounded-lg">
                    <div className="bg-primary-foreground h-3 w-3 rounded-sm" />
                </div>
                <div>
                    <h1 className="text-foreground text-sm font-semibold tracking-wide">LUMIRIS</h1>
                    <p className="text-muted-foreground font-mono text-[10px] tracking-widest">PLATFORM</p>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-2">
                <div className="space-y-0.5">
                    {visibleItems.map((item) => {
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

            <div className="border-border border-t px-4 py-3">
                <div className="flex items-center gap-2">
                    <ScrollText className="text-muted-foreground/50 h-3.5 w-3.5" />
                    <span className="text-muted-foreground/50 font-mono text-[10px]">v6.1 · 40/25/25/10</span>
                </div>
            </div>
        </aside>
    );
}

export const Sidebar = memo(SidebarComponent);
