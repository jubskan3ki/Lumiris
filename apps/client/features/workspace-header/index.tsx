'use client';

import { Menu } from 'lucide-react';
import { Button } from '@lumiris/ui/components/button';
import { cn } from '@lumiris/ui/lib/cn';
import { NotificationsBell } from '@/features/notifications-bell';
import { UserMenu } from '@/features/user-menu';
import { useWorkspaceShell } from '@/features/workspace-shell';
import { useWorkspaceNotifications } from '@/features/workspace-shell/hooks';
import { useCurrentArtisan } from '@/lib/current-artisan';

interface WorkspaceHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export function WorkspaceHeader({ title, description, actions }: WorkspaceHeaderProps) {
    const { openSidebar } = useWorkspaceShell();
    const artisan = useCurrentArtisan();
    const notifications = useWorkspaceNotifications(artisan);

    return (
        <header className="border-border bg-card sticky top-0 z-20 border-b">
            <div className="flex items-center gap-3 px-4 py-3 md:gap-4 md:px-8 md:py-4">
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Ouvrir le menu"
                    className="md:hidden"
                    onClick={openSidebar}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-muted-foreground truncate text-[11px] font-medium uppercase tracking-wider">
                            {artisan.atelierName} · {artisan.city}
                        </p>
                        <span
                            className={cn(
                                'rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase',
                                artisan.tier === 'Solo' && 'bg-tier-solo/15 text-tier-solo',
                                artisan.tier === 'Studio' && 'bg-tier-studio/15 text-tier-studio',
                                artisan.tier === 'Maison' && 'bg-tier-maison/15 text-tier-maison',
                            )}
                        >
                            {artisan.tier}
                        </span>
                    </div>
                    <h1 className="text-foreground mt-1 truncate text-xl font-semibold tracking-tight">{title}</h1>
                    {description && <p className="text-muted-foreground mt-0.5 truncate text-sm">{description}</p>}
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    {actions}
                    <NotificationsBell notifications={notifications} />
                    <UserMenu artisan={artisan} />
                </div>
            </div>
        </header>
    );
}
