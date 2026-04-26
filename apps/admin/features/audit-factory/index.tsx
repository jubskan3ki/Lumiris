'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, ChevronRight, ArrowLeft, FileCode, Smartphone, Send } from 'lucide-react';
import { computeScore } from '@lumiris/core';
import { MANDATORY_DPP_FIELDS } from '@lumiris/core/constants';
import { mockDpps as dppRecords } from '@lumiris/mock-data/dpp';
import { mockCertificates } from '@lumiris/mock-data/certificates';
import type { Certificate, DPPRecord, ScoreResult } from '@lumiris/types';
import { IrisGrade } from '@lumiris/scoring-ui/components/iris-grade';
import { MissingFieldsBadge } from '@lumiris/scoring-ui/components/missing-fields-badge';
import { ScoreBreakdown } from '@lumiris/scoring-ui/components/score-breakdown';
import { ScoreReasonsList } from '@lumiris/scoring-ui/components/score-reasons-list';
import { StatusBadge } from '@lumiris/scoring-ui/components/status-badge';
import { cn } from '@lumiris/ui/lib/cn';

const MANDATORY_SET: ReadonlySet<string> = new Set(MANDATORY_DPP_FIELDS);

interface AuditedDpp {
    record: DPPRecord;
    score: ScoreResult;
    certificates: readonly Certificate[];
}

function audit(record: DPPRecord, allCerts: readonly Certificate[]): AuditedDpp {
    const certificates = allCerts.filter((c) => c.factory === record.supplierFactory);
    return { record, score: computeScore(record, { certificates }), certificates };
}

function PhonePreview({ audited }: { audited: AuditedDpp }) {
    const { record, score } = audited;
    const isGradeE = score.grade === 'E';
    return (
        <div className="flex flex-col items-center">
            <div className="mb-4 flex items-center gap-2">
                <Smartphone className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-xs font-medium">Iris Card Preview</span>
            </div>
            <div className="opal-shadow-lg border-foreground/10 bg-card relative w-[280px] rounded-[2rem] border-[6px] p-1">
                <div className="bg-foreground/10 mx-auto mb-2 h-5 w-24 rounded-b-xl" />
                <div className={cn('rounded-[1.25rem] p-4', isGradeE ? 'bg-lumiris-rose/4' : 'bg-background')}>
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-muted-foreground font-mono text-[9px] tracking-wider">
                            DIGITAL PRODUCT PASSPORT
                        </span>
                        <StatusBadge status={record.status} size="sm" />
                    </div>

                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h4 className="text-foreground text-[15px] font-semibold leading-tight">
                                {record.productName}
                            </h4>
                            <p className="text-muted-foreground mt-1 text-[11px]">{record.brand}</p>
                        </div>
                        <IrisGrade grade={score.grade} size="md" />
                    </div>

                    <div className="mt-4 space-y-2.5">
                        {Object.entries(record.rawData)
                            .filter(([key]) => key !== 'eu_compliance_version')
                            .slice(0, 6)
                            .map(([key, value]) => {
                                const isMissing = value === null || value === undefined;
                                const isMandatory = MANDATORY_SET.has(key);
                                return (
                                    <div key={key} className="flex items-center justify-between">
                                        <span className="text-muted-foreground max-w-[120px] truncate text-[10px] capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </span>
                                        <span
                                            className={cn(
                                                'text-[10px] font-medium',
                                                isMissing && isMandatory
                                                    ? 'text-lumiris-rose'
                                                    : isMissing
                                                      ? 'text-muted-foreground/40'
                                                      : 'text-foreground',
                                            )}
                                        >
                                            {isMissing
                                                ? isMandatory
                                                    ? 'Required'
                                                    : 'N/A'
                                                : typeof value === 'number'
                                                  ? value.toLocaleString()
                                                  : String(value)}
                                        </span>
                                    </div>
                                );
                            })}
                    </div>

                    {isGradeE && (
                        <div className="border-lumiris-rose/20 bg-lumiris-rose/6 mt-4 rounded-lg border p-2.5 text-center">
                            <p className="text-lumiris-rose text-[10px] font-semibold">GRADE E — Cannot be published</p>
                        </div>
                    )}

                    <div className="border-border mt-4 border-t pt-3">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground/50 font-mono text-[8px]">Powered by LUMIRIS</span>
                            <span className="text-muted-foreground/50 font-mono text-[8px]">{record.id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function RawDataView({ audited }: { audited: AuditedDpp }) {
    const { record, score } = audited;
    return (
        <div className="opal-shadow border-border bg-card rounded-xl border p-5">
            <div className="mb-4 flex items-center gap-2">
                <FileCode className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground text-xs font-medium">Raw Supplier Data</span>
                <span className="text-muted-foreground/50 ml-auto font-mono text-[10px]">{record.id}</span>
            </div>
            <div className="bg-background rounded-lg p-4 font-mono text-xs">
                {Object.entries(record.rawData).map(([key, value]) => {
                    const isMandatory = MANDATORY_SET.has(key);
                    const isMissing = value === null || value === undefined;
                    return (
                        <div key={key} className="flex py-1">
                            <span
                                className={cn(
                                    'min-w-[200px]',
                                    isMissing && isMandatory ? 'text-lumiris-rose' : 'text-muted-foreground',
                                )}
                            >
                                {key}
                            </span>
                            <span
                                className={cn(
                                    isMissing && isMandatory
                                        ? 'text-lumiris-rose font-medium'
                                        : isMissing
                                          ? 'text-muted-foreground/40'
                                          : 'text-foreground',
                                )}
                            >
                                {isMissing ? (
                                    <span className="flex items-center gap-1">
                                        null
                                        {isMandatory && <AlertCircle className="text-lumiris-rose inline h-3 w-3" />}
                                    </span>
                                ) : typeof value === 'string' ? (
                                    `"${value}"`
                                ) : (
                                    String(value)
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>

            {score.reasons.length > 0 && (
                <div className="border-lumiris-rose/15 bg-lumiris-rose/4 mt-4 rounded-lg border p-3">
                    <p className="text-lumiris-rose flex items-center gap-1.5 text-xs font-medium">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {score.reasons.length} reason{score.reasons.length > 1 ? 's' : ''} dragging the score down
                    </p>
                    <ScoreReasonsList reasons={score.reasons} className="mt-2" />
                </div>
            )}
        </div>
    );
}

function FocusedAuditView({ audited, onBack }: { audited: AuditedDpp; onBack: () => void }) {
    const { record, score } = audited;
    const [showToast, setShowToast] = useState(false);

    const handleCertify = useCallback(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
        >
            <button
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to pipeline
            </button>

            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <IrisGrade grade={score.grade} size="lg" />
                    <div>
                        <h3 className="text-foreground text-lg font-semibold">{record.productName}</h3>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            {record.brand} &middot; {record.supplierFactory}
                        </p>
                        <p className="text-muted-foreground mt-2 font-mono text-xs">
                            Live score: <span className="text-foreground">{score.total.toFixed(1)} / 100</span>{' '}
                            <MissingFieldsBadge dpp={record} className="ml-2 align-middle" showWhenComplete />
                        </p>
                    </div>
                </div>
                <StatusBadge status={record.status} size="md" />
            </div>

            <div className="opal-shadow border-border bg-card rounded-xl border p-5">
                <div className="text-muted-foreground mb-3 text-xs font-medium uppercase tracking-wider">
                    50 / 30 / 20 Breakdown
                </div>
                <ScoreBreakdown breakdown={score.breakdown} weights={score.weights} />
            </div>

            <div className="flex items-start gap-8">
                <div className="flex-1">
                    <RawDataView audited={audited} />
                </div>
                <div className="flex-shrink-0">
                    <PhonePreview audited={audited} />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleCertify}
                    disabled={score.grade === 'E'}
                    className={cn(
                        'opal-shadow flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all',
                        score.grade === 'E'
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-lumiris-emerald text-primary-foreground hover:opacity-90',
                    )}
                >
                    <Send className="h-4 w-4" />
                    Certify & Publish
                </button>
            </div>

            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        className="opal-shadow-lg border-lumiris-emerald/20 bg-card fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3"
                    >
                        <CheckCircle2 className="text-lumiris-emerald h-5 w-5" />
                        <div>
                            <p className="text-foreground text-sm font-medium">Product Validated</p>
                            <p className="text-muted-foreground text-xs">DPP published to B2C consumer layer.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function AuditFactoryComponent() {
    const audited = useMemo<readonly AuditedDpp[]>(
        () => dppRecords.map((record) => audit(record, mockCertificates)),
        [],
    );
    const [selected, setSelected] = useState<AuditedDpp | null>(null);

    if (selected) {
        return <FocusedAuditView audited={selected} onBack={() => setSelected(null)} />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-foreground text-xl font-semibold">Audit Factory</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    {audited.length} products in the pipeline. Score is computed live by{' '}
                    <span className="text-foreground font-mono">@lumiris/core</span>.
                </p>
            </div>

            <div className="opal-shadow border-border bg-card overflow-hidden rounded-xl border">
                <div className="border-border grid grid-cols-[1fr_1.5fr_1fr_0.7fr_44px_0.6fr_32px] items-center gap-4 border-b px-5 py-3">
                    <span className="text-muted-foreground text-[11px] font-medium">ID</span>
                    <span className="text-muted-foreground text-[11px] font-medium">Product</span>
                    <span className="text-muted-foreground text-[11px] font-medium">Factory</span>
                    <span className="text-muted-foreground text-[11px] font-medium">Status</span>
                    <span className="text-muted-foreground text-[11px] font-medium">Grade</span>
                    <span className="text-muted-foreground text-[11px] font-medium">Score</span>
                    <span />
                </div>

                {audited.map((entry) => (
                    <button
                        key={entry.record.id}
                        onClick={() => setSelected(entry)}
                        className="border-border/60 hover:bg-lumiris-emerald/3 grid w-full grid-cols-[1fr_1.5fr_1fr_0.7fr_44px_0.6fr_32px] items-center gap-4 border-b px-5 py-3.5 text-left transition-colors last:border-b-0"
                    >
                        <div>
                            <span className="text-foreground font-mono text-xs">{entry.record.id}</span>
                            <br />
                            <span className="text-muted-foreground/50 font-mono text-[10px]">{entry.record.sku}</span>
                        </div>
                        <div>
                            <span className="text-foreground text-sm">{entry.record.productName}</span>
                            <br />
                            <span className="text-muted-foreground text-xs">{entry.record.brand}</span>
                        </div>
                        <span className="text-muted-foreground truncate text-xs">{entry.record.supplierFactory}</span>
                        <StatusBadge status={entry.record.status} />
                        <IrisGrade grade={entry.score.grade} size="sm" />
                        <div className="flex items-center gap-2">
                            <span className="text-foreground font-mono text-xs">{entry.score.total.toFixed(0)}</span>
                            <span className="text-muted-foreground/50 font-mono text-[10px]">/100</span>
                        </div>
                        <ChevronRight className="text-muted-foreground/30 h-4 w-4" />
                    </button>
                ))}
            </div>
        </div>
    );
}

export const AuditFactory = memo(AuditFactoryComponent);
