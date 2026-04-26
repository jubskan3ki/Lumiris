'use client';

import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    BookOpen,
    Clock,
    User,
    ArrowLeft,
    CheckCircle2,
    Bold,
    Italic,
    List,
    Heading1,
    Image,
    Link2,
    Save,
} from 'lucide-react';
import { cn } from '@lumiris/ui/lib/cn';
import { mockJournalArticles as journalArticles } from '@lumiris/mock-data/journal';
import type { JournalArticle } from '@lumiris/types';
import { StatusBadge } from '@lumiris/scoring-ui/components/status-badge';

const categoryColors: Record<string, string> = {
    Regulation: 'bg-lumiris-rose/6 text-lumiris-rose border-lumiris-rose/15',
    Lifestyle: 'bg-lumiris-cyan/8 text-lumiris-cyan border-lumiris-cyan/15',
    Audit: 'bg-lumiris-amber/8 text-lumiris-amber border-lumiris-amber/15',
    Sustainability: 'bg-lumiris-emerald/6 text-lumiris-emerald border-lumiris-emerald/15',
};

// Editor toolbar button
function ToolbarButton({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
    return (
        <button
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-2 transition-colors"
            title={label}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
}

// Article editor view
function ArticleEditor({ article, onBack }: { article: JournalArticle | null; onBack: () => void }) {
    const [showToast, setShowToast] = useState(false);

    const handleSave = useCallback(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-5"
        >
            {/* Back + Actions */}
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to articles
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        className="border-border bg-card text-foreground hover:bg-muted flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                    >
                        <Save className="h-3.5 w-3.5" />
                        Save Draft
                    </button>
                    <button className="bg-lumiris-emerald text-primary-foreground flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90">
                        Publish
                    </button>
                </div>
            </div>

            {/* Editor card */}
            <div className="opal-shadow border-border bg-card rounded-xl border">
                {/* Title */}
                <div className="border-border border-b px-6 py-5">
                    <input
                        type="text"
                        defaultValue={article?.title ?? ''}
                        placeholder="Article title..."
                        className="text-foreground placeholder-muted-foreground/40 w-full bg-transparent text-xl font-semibold outline-none"
                    />
                    <div className="mt-3 flex items-center gap-3">
                        {article && (
                            <span
                                className={cn(
                                    'rounded-md border px-2 py-0.5 text-[11px] font-medium',
                                    categoryColors[article.category],
                                )}
                            >
                                {article.category}
                            </span>
                        )}
                        {article && (
                            <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                <User className="h-3 w-3" />
                                {article.author}
                            </span>
                        )}
                        {article && (
                            <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                <Clock className="h-3 w-3" />
                                {article.readTime} read
                            </span>
                        )}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="border-border flex items-center gap-0.5 border-b px-4 py-1.5">
                    <ToolbarButton icon={Heading1} label="Heading" />
                    <ToolbarButton icon={Bold} label="Bold" />
                    <ToolbarButton icon={Italic} label="Italic" />
                    <div className="bg-border mx-1.5 h-5 w-px" />
                    <ToolbarButton icon={List} label="List" />
                    <ToolbarButton icon={Link2} label="Link" />
                    <ToolbarButton icon={Image} label="Image" />
                </div>

                {/* Content area */}
                <div className="min-h-[400px] px-6 py-5">
                    <textarea
                        defaultValue={article?.excerpt ?? ''}
                        placeholder="Start writing your article..."
                        className="text-foreground placeholder-muted-foreground/40 min-h-[380px] w-full resize-none bg-transparent text-sm leading-relaxed outline-none"
                    />
                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        className="border-lumiris-emerald/20 bg-card opal-shadow-lg fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-3"
                    >
                        <CheckCircle2 className="text-lumiris-emerald h-5 w-5" />
                        <div>
                            <p className="text-foreground text-sm font-medium">Draft Saved</p>
                            <p className="text-muted-foreground text-xs">Your changes have been saved.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function JournalComponent() {
    const [editingArticle, setEditingArticle] = useState<JournalArticle | null | 'new'>(null);

    if (editingArticle !== null) {
        return (
            <ArticleEditor
                article={editingArticle === 'new' ? null : editingArticle}
                onBack={() => setEditingArticle(null)}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-foreground text-xl font-semibold">LUMIRIS Journal</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage blog posts and editorial content for the website.
                    </p>
                </div>
                <button
                    onClick={() => setEditingArticle('new')}
                    className="bg-lumiris-emerald text-primary-foreground opal-shadow flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                >
                    <Plus className="h-4 w-4" />
                    New Article
                </button>
            </div>

            {/* Article List */}
            <div className="opal-shadow border-border bg-card overflow-hidden rounded-xl border">
                {/* Table Header */}
                <div className="border-border grid grid-cols-[2fr_0.8fr_0.6fr_0.8fr_0.5fr] items-center gap-4 border-b px-5 py-3">
                    <span className="text-muted-foreground text-[11px] font-medium">Article Title</span>
                    <span className="text-muted-foreground text-[11px] font-medium">Category</span>
                    <span className="text-muted-foreground text-[11px] font-medium">Status</span>
                    <span className="text-muted-foreground text-[11px] font-medium">Author</span>
                    <span className="text-muted-foreground text-[11px] font-medium">Updated</span>
                </div>

                {/* Rows */}
                {journalArticles.map((article) => (
                    <button
                        key={article.id}
                        onClick={() => setEditingArticle(article)}
                        className="border-border/60 hover:bg-lumiris-emerald/3 grid w-full grid-cols-[2fr_0.8fr_0.6fr_0.8fr_0.5fr] items-center gap-4 border-b px-5 py-4 text-left transition-colors last:border-b-0"
                    >
                        <div className="flex items-start gap-3">
                            <BookOpen className="text-muted-foreground/40 mt-0.5 h-4 w-4 flex-shrink-0" />
                            <div>
                                <p className="text-foreground text-sm font-medium leading-snug">{article.title}</p>
                                <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">{article.excerpt}</p>
                            </div>
                        </div>
                        <span
                            className={cn(
                                'inline-flex w-fit rounded-md border px-2 py-0.5 text-[11px] font-medium',
                                categoryColors[article.category],
                            )}
                        >
                            {article.category}
                        </span>
                        <StatusBadge status={article.status} />
                        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                            <User className="h-3 w-3" />
                            {article.author}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            {new Date(article.updatedAt).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                            })}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export const Journal = memo(JournalComponent);
