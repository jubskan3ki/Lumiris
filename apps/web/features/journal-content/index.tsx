'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const categories = ['All', 'EU Regulations', 'Audit Stories', 'Greenwashing Alerts'];

const articles = [
    {
        slug: 'eu-espr-regulation-2026',
        title: 'The EU ESPR Regulation: What It Means for Every Brand Selling in Europe',
        excerpt:
            'The European Sustainable Products Regulation is reshaping how companies disclose product data. Here is what changes in 2026 and why LUMIRIS is already aligned.',
        category: 'EU Regulations',
        readTime: '8 min read',
        date: 'April 12, 2026',
        image: '/images/journal-eu-regulation.jpg',
        featured: true,
    },
    {
        slug: 'anatomy-of-greenwashing',
        title: 'Anatomy of a Greenwash: How We Caught a Major Brand Faking Organic Claims',
        excerpt:
            "A deep dive into LUMIRIS Audit Case #0047. What we found when we traced a 'certified organic' label back to its source -- and what the data actually showed.",
        category: 'Greenwashing Alerts',
        readTime: '12 min read',
        date: 'March 28, 2026',
        image: '/images/journal-greenwashing.jpg',
        featured: true,
    },
    {
        slug: 'supply-chain-transparency-report',
        title: '2026 Supply Chain Transparency Report: The State of Fashion',
        excerpt:
            'Our annual analysis of 2,400 products across 180 brands reveals troubling patterns -- and a handful of companies leading the way.',
        category: 'Audit Stories',
        readTime: '15 min read',
        date: 'March 15, 2026',
        image: '/images/journal-supply-chain.jpg',
        featured: false,
    },
    {
        slug: 'grade-e-meaning',
        title: 'What a Grade E Really Means (And Why Silence Is the Problem)',
        excerpt:
            'An in-depth look at the Golden Rule: why LUMIRIS scores missing data as an automatic E, and how brands can fix it.',
        category: 'Audit Stories',
        readTime: '6 min read',
        date: 'February 22, 2026',
        image: '/images/journal-hero.jpg',
        featured: false,
    },
    {
        slug: 'eu-digital-product-passport',
        title: 'Digital Product Passport: The Technology Behind Traceable Fashion',
        excerpt:
            'The EU is mandating digital passports for products. We explain the tech stack, the timeline, and how LUMIRIS integrates with DPP standards.',
        category: 'EU Regulations',
        readTime: '10 min read',
        date: 'February 10, 2026',
        image: '/images/journal-eu-regulation.jpg',
        featured: false,
    },
    {
        slug: 'fast-fashion-carbon-lie',
        title: "The Carbon Neutral Lie: Why Fast Fashion's Climate Claims Don't Hold Up",
        excerpt:
            'We audited the carbon offset claims of five major fast-fashion brands. The results were startling: not a single one met third-party verification standards.',
        category: 'Greenwashing Alerts',
        readTime: '9 min read',
        date: 'January 30, 2026',
        image: '/images/journal-greenwashing.jpg',
        featured: false,
    },
];

function CategoryBadge({ category }: { category: string }) {
    const colorMap: Record<string, string> = {
        'EU Regulations': 'text-grade-b bg-grade-b/8 border-grade-b/15',
        'Audit Stories': 'text-grade-a bg-grade-a/8 border-grade-a/15',
        'Greenwashing Alerts': 'text-grade-e bg-grade-e/8 border-grade-e/15',
    };
    return (
        <span
            className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${colorMap[category] || 'text-muted-foreground bg-muted border-border'}`}
        >
            {category}
        </span>
    );
}

function FeaturedCard({ article }: { article: (typeof articles)[0] }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group cursor-pointer"
        >
            <div className="border-border relative mb-5 aspect-[16/9] overflow-hidden rounded-2xl border shadow-sm">
                <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="from-foreground/30 absolute inset-0 bg-gradient-to-t to-transparent" />
                <div className="absolute bottom-4 left-4">
                    <CategoryBadge category={article.category} />
                </div>
            </div>
            <div className="text-muted-foreground mb-2 flex items-center gap-3 text-[11px]">
                <span className="font-mono">{article.date}</span>
                <span>--</span>
                <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                </span>
            </div>
            <h2 className="text-foreground group-hover:text-grade-a text-balance text-xl font-semibold leading-snug transition-colors duration-200">
                {article.title}
            </h2>
            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">{article.excerpt}</p>
            <div className="text-foreground group-hover:text-grade-a mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors">
                Read article
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
        </motion.article>
    );
}

function ArticleCard({ article, index }: { article: (typeof articles)[0]; index: number }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            className="border-border group flex cursor-pointer flex-col gap-5 border-b py-6 last:border-0 sm:flex-row"
        >
            <div className="border-border relative aspect-[16/10] w-full flex-shrink-0 overflow-hidden rounded-xl border sm:aspect-[4/3] sm:w-48">
                <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 192px"
                />
            </div>
            <div className="flex flex-1 flex-col justify-center">
                <div className="mb-2 flex items-center gap-3">
                    <CategoryBadge category={article.category} />
                    <span className="text-muted-foreground font-mono text-[11px]">{article.date}</span>
                </div>
                <h3 className="text-foreground group-hover:text-grade-a text-balance text-base font-semibold leading-snug transition-colors duration-200">
                    {article.title}
                </h3>
                <p className="text-muted-foreground mt-1.5 line-clamp-2 text-sm leading-relaxed">{article.excerpt}</p>
                <span className="text-muted-foreground mt-2 flex items-center gap-1 text-[11px]">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                </span>
            </div>
        </motion.article>
    );
}

export function JournalContent() {
    const [activeCategory, setActiveCategory] = useState('All');

    const featured = articles.filter((a) => a.featured);
    const rest = articles.filter((a) => !a.featured);

    const filteredRest = activeCategory === 'All' ? rest : rest.filter((a) => a.category === activeCategory);

    return (
        <div className="pb-20 pt-28">
            <section className="mx-auto mb-16 max-w-5xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-muted-foreground mb-4 text-xs font-medium uppercase tracking-[0.25em]">
                        Editorial
                    </p>
                    <h1 className="text-foreground text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                        The LUMIRIS Journal
                    </h1>
                    <p className="text-muted-foreground mt-4 max-w-lg text-pretty text-base leading-relaxed">
                        In-depth reporting on product transparency, EU regulation, and the fight against greenwashing.
                    </p>
                </motion.div>
            </section>

            <section className="mx-auto mb-20 max-w-5xl px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {featured.map((article) => (
                        <FeaturedCard key={article.slug} article={article} />
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-5xl px-6">
                <div className="mb-8 flex flex-wrap items-center gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`rounded-lg px-3.5 py-1.5 text-sm transition-colors duration-200 ${
                                activeCategory === cat
                                    ? 'bg-foreground text-background font-medium'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col">
                    {filteredRest.length === 0 && (
                        <p className="text-muted-foreground py-8 text-center text-sm">
                            No articles in this category yet.
                        </p>
                    )}
                    {filteredRest.map((article, i) => (
                        <ArticleCard key={article.slug} article={article} index={i} />
                    ))}
                </div>
            </section>
        </div>
    );
}
