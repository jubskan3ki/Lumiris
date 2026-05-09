'use client';

import { Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@lumiris/ui/components/avatar';
import { Button } from '@lumiris/ui/components/button';
import { cn } from '@lumiris/ui/lib/cn';
import { currentArtisan } from '@/lib/current-artisan';

interface WorkspaceHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export function WorkspaceHeader({ title, description, actions }: WorkspaceHeaderProps) {
    const initials = currentArtisan.displayName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2);

    return (
        <header className="border-border bg-card sticky top-0 z-20 border-b">
            <div className="flex items-center gap-4 px-8 py-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
                            {currentArtisan.atelierName} · {currentArtisan.city}
                        </p>
                        <span
                            className={cn(
                                'rounded-md px-2 py-0.5 font-mono text-[10px] font-semibold uppercase',
                                currentArtisan.tier === 'Solo' && 'bg-grade-a/8 text-grade-a',
                                currentArtisan.tier === 'Studio' && 'bg-grade-b/8 text-grade-b',
                                currentArtisan.tier === 'Maison' && 'bg-grade-c/8 text-grade-c',
                            )}
                        >
                            {currentArtisan.tier}
                        </span>
                    </div>
                    <h1 className="text-foreground mt-1 truncate text-xl font-semibold tracking-tight">{title}</h1>
                    {description && <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>}
                </div>

                <div className="flex items-center gap-3">
                    {actions}
                    <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                        <Bell className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={currentArtisan.photoUrl} alt={currentArtisan.displayName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
