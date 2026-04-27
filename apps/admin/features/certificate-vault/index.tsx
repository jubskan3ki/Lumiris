'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Building2, Calendar, Scan, Flag } from 'lucide-react';
import { cn } from '@lumiris/ui/lib/cn';
import { mockCertificates as certificates } from '@lumiris/mock-data/certificates';
import { StatusBadge } from '@lumiris/scoring-ui/components/status-badge';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
};

// Find cross-check discrepancies
function getCrossCheckAlerts() {
    const factoryMap = new Map<string, Array<{ brand: string; carbonScore: number | null; certId: string }>>();
    certificates.forEach((cert) => {
        const existing = factoryMap.get(cert.factory) || [];
        existing.push({
            brand: cert.brand,
            carbonScore: cert.carbonScore,
            certId: cert.id,
        });
        factoryMap.set(cert.factory, existing);
    });

    const alerts: Array<{
        factory: string;
        entries: Array<{ brand: string; carbonScore: number | null; certId: string }>;
    }> = [];

    factoryMap.forEach((entries, factory) => {
        if (entries.length > 1) {
            const scores = entries.map((e) => e.carbonScore).filter((s) => s !== null) as number[];
            if (scores.length > 1) {
                const max = Math.max(...scores);
                const min = Math.min(...scores);
                if (max - min > 1) {
                    alerts.push({ factory, entries });
                }
            }
        }
    });

    return alerts;
}

function CertificateVaultComponent() {
    const crossCheckAlerts = getCrossCheckAlerts();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-foreground text-xl font-semibold">Certificate Vault</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    AI-extracted metadata from submitted certification documents. {certificates.length} documents
                    indexed.
                </p>
            </div>

            {/* Cross-Check Alerts */}
            {crossCheckAlerts.length > 0 && (
                <div className="border-lumiris-rose/20 bg-lumiris-rose/4 rounded-xl border p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <Flag className="text-lumiris-rose h-4 w-4" />
                        <span className="text-lumiris-rose text-sm font-semibold">
                            Cross-Check Discrepancies Detected
                        </span>
                    </div>
                    {crossCheckAlerts.map((alert) => (
                        <div key={alert.factory} className="border-lumiris-rose/15 bg-card rounded-lg border p-4">
                            <p className="text-foreground flex items-center gap-2 text-xs font-medium">
                                <Building2 className="text-lumiris-rose h-3.5 w-3.5" />
                                {alert.factory}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-3">
                                {alert.entries.map((entry) => (
                                    <div
                                        key={entry.certId}
                                        className="border-border bg-background flex items-center gap-2 rounded-lg border px-3 py-1.5"
                                    >
                                        <span className="text-muted-foreground text-xs">{entry.brand}</span>
                                        <span
                                            className={cn(
                                                'font-mono text-xs font-semibold',
                                                entry.carbonScore && entry.carbonScore > 3
                                                    ? 'text-lumiris-rose'
                                                    : 'text-lumiris-emerald',
                                            )}
                                        >
                                            {entry.carbonScore ?? 'N/A'} kgCO2e
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-lumiris-rose/80 mt-2 text-[11px]">
                                Carbon score discrepancy detected for shared factory. Manual verification required.
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Certificate List */}
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
                {certificates.map((cert) => (
                    <motion.div
                        key={cert.id}
                        variants={item}
                        className={cn(
                            'opal-shadow bg-card rounded-xl border p-5 transition-colors',
                            cert.crossCheckFlag ? 'border-lumiris-rose/20' : 'border-border',
                        )}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        'rounded-lg p-2',
                                        cert.status === 'Expired'
                                            ? 'bg-lumiris-rose/8'
                                            : cert.status === 'Pending_Review'
                                              ? 'bg-lumiris-amber/8'
                                              : 'bg-lumiris-emerald/6',
                                    )}
                                >
                                    <FileText
                                        className={cn(
                                            'h-4 w-4',
                                            cert.status === 'Expired'
                                                ? 'text-lumiris-rose'
                                                : cert.status === 'Pending_Review'
                                                  ? 'text-lumiris-amber'
                                                  : 'text-lumiris-emerald',
                                        )}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-foreground text-sm font-medium">{cert.documentName}</h4>
                                        {cert.crossCheckFlag && (
                                            <span className="bg-lumiris-rose/8 text-lumiris-rose flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium">
                                                <AlertTriangle className="h-2.5 w-2.5" />
                                                FLAG
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground mt-0.5 text-xs">
                                        {cert.brand} &middot; {cert.type}
                                    </p>
                                </div>
                            </div>
                            <StatusBadge status={cert.status} />
                        </div>

                        <div className="mt-4 grid grid-cols-4 gap-4">
                            <div>
                                <span className="text-muted-foreground/60 text-[11px]">Organization</span>
                                <p className="text-foreground mt-0.5 text-xs">{cert.organization}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground/60 text-[11px]">Expiry</span>
                                <p
                                    className={cn(
                                        'mt-0.5 flex items-center gap-1 text-xs',
                                        cert.status === 'Expired' ? 'text-lumiris-rose' : 'text-foreground',
                                    )}
                                >
                                    {cert.status === 'Expired' && <Calendar className="h-3 w-3" />}
                                    {new Date(cert.expiryDate).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground/60 text-[11px]">Scope</span>
                                <p className="text-foreground mt-0.5 text-xs">{cert.scope}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground/60 text-[11px]">Factory</span>
                                <p className="text-foreground mt-0.5 flex items-center gap-1 text-xs">
                                    <Scan className="text-muted-foreground/40 h-3 w-3" />
                                    {cert.factory}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

export const CertificateVault = memo(CertificateVaultComponent);
