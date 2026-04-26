'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, FileText, Terminal } from 'lucide-react';
import { cn } from '@lumiris/ui/lib/cn';
import { mockAuditLog as auditLog } from '@lumiris/mock-data/audit-log';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.04 },
    },
};

const item = {
    hidden: { opacity: 0, x: -8 },
    show: { opacity: 1, x: 0 },
};

const actionColors: Record<string, string> = {
    'Verified Carbon Proof': 'text-lumiris-emerald',
    'Flagged Anomaly': 'text-lumiris-rose',
    'Published DPP': 'text-lumiris-emerald',
    'Grade E Assigned': 'text-lumiris-rose',
    'Certificate Expiry Alert': 'text-lumiris-amber',
    'Cross-Check Flag': 'text-lumiris-rose',
    'Initiated Audit': 'text-lumiris-cyan',
    'New Submission': 'text-muted-foreground',
};

function AuditLogViewComponent() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-foreground text-xl font-semibold">User Feedback & Audit Trail</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    Complete audit log with full traceability. All actions are immutable.
                </p>
            </div>

            {/* Log Feed */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="opal-shadow border-border bg-card rounded-xl border"
            >
                {/* Header */}
                <div className="border-border flex items-center gap-2 border-b px-5 py-3.5">
                    <Terminal className="text-muted-foreground h-4 w-4" />
                    <span className="text-muted-foreground text-xs font-medium">Immutable Audit Trail</span>
                    <span className="text-muted-foreground/50 ml-auto font-mono text-[10px]">
                        {auditLog.length} entries
                    </span>
                </div>

                {/* Log Entries */}
                <div className="divide-border/60 divide-y">
                    {auditLog.map((entry, idx) => (
                        <motion.div key={idx} variants={item} className="hover:bg-muted/30 px-5 py-4 transition-colors">
                            {/* Signature Line */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <Clock className="text-muted-foreground/50 h-3 w-3" />
                                <span className="text-muted-foreground/60 font-mono">
                                    {new Date(entry.timestamp).toISOString()}
                                </span>
                                <span className="text-muted-foreground/30">&mdash;</span>
                                <span
                                    className={cn(
                                        'flex items-center gap-1 font-mono font-medium',
                                        entry.auditorId === 'SYSTEM' ? 'text-muted-foreground' : 'text-lumiris-cyan',
                                    )}
                                >
                                    <User className="h-3 w-3" />
                                    {entry.auditorId}
                                </span>
                                <span className="text-muted-foreground/30">&mdash;</span>
                                <span className={cn('font-medium', actionColors[entry.action] || 'text-foreground')}>
                                    {entry.action}
                                </span>
                            </div>
                            {/* Details */}
                            <div className="mt-1.5 flex items-start gap-2 text-xs">
                                <FileText className="text-muted-foreground/30 mt-0.5 h-3 w-3 flex-shrink-0" />
                                <span className="text-muted-foreground leading-relaxed">
                                    <span className="text-foreground font-mono font-medium">{entry.recordId}</span>{' '}
                                    &mdash; {entry.details}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export const AuditLogView = memo(AuditLogViewComponent);
