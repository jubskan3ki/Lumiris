'use client';

import type { HTMLAttributes } from 'react';
import type { AuditStatus, CertificateStatus, JournalStatus, RegulatoryStatus } from '@lumiris/types';
import { cn } from '@lumiris/ui/lib/cn';

export type LumirisStatus = AuditStatus | CertificateStatus | JournalStatus | RegulatoryStatus;

export type StatusBadgeSize = 'sm' | 'md';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
    status: LumirisStatus | (string & {});
    size?: StatusBadgeSize;
}

interface StatusConfig {
    label: string;
    tone: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
    // Audit pipeline
    Draft: { label: 'Draft', tone: 'bg-muted text-muted-foreground border-border' },
    Audit_Pending: {
        label: 'Pending',
        tone: 'border-lumiris-amber/25 bg-lumiris-amber/10 text-lumiris-amber',
    },
    Flagged_Anomalies: {
        label: 'Flagged',
        tone: 'border-lumiris-rose/20 bg-lumiris-rose/8 text-lumiris-rose',
    },
    Published_Live: {
        label: 'Published',
        tone: 'border-lumiris-emerald/20 bg-lumiris-emerald/8 text-lumiris-emerald',
    },
    Grade_E: {
        label: 'Grade E',
        tone: 'border-lumiris-rose/25 bg-lumiris-rose/10 text-lumiris-rose',
    },

    // Certificate
    Valid: {
        label: 'Valid',
        tone: 'border-lumiris-emerald/20 bg-lumiris-emerald/8 text-lumiris-emerald',
    },
    Expired: { label: 'Expired', tone: 'border-lumiris-rose/20 bg-lumiris-rose/8 text-lumiris-rose' },
    Pending_Review: {
        label: 'Review',
        tone: 'border-lumiris-amber/25 bg-lumiris-amber/10 text-lumiris-amber',
    },

    // Regulatory + Journal
    Active: {
        label: 'Active',
        tone: 'border-lumiris-emerald/20 bg-lumiris-emerald/8 text-lumiris-emerald',
    },
    Pending: {
        label: 'Pending',
        tone: 'border-lumiris-amber/25 bg-lumiris-amber/10 text-lumiris-amber',
    },
    Published: {
        label: 'Published',
        tone: 'border-lumiris-emerald/20 bg-lumiris-emerald/8 text-lumiris-emerald',
    },
    Scheduled: {
        label: 'Scheduled',
        tone: 'border-lumiris-cyan/25 bg-lumiris-cyan/10 text-lumiris-cyan',
    },
};

const FALLBACK: StatusConfig = {
    label: '—',
    tone: 'bg-muted text-muted-foreground border-border',
};

const SIZE: Record<StatusBadgeSize, string> = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
};

/**
 * Single tone-mapping for every "status" surface in the platform — audit
 * pipeline, certificate validity, journal & regulatory items. Apps must
 * never reproduce this mapping locally.
 */
export function StatusBadge({ status, size = 'sm', className, ...rest }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] ?? { ...FALLBACK, label: String(status) };
    return (
        <span
            className={cn('inline-flex items-center rounded-md border font-medium', SIZE[size], config.tone, className)}
            {...rest}
        >
            {config.label}
        </span>
    );
}
