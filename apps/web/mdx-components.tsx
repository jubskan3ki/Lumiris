import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        h1: ({ children }) => (
            <h1 className="text-foreground mb-6 mt-10 text-3xl font-bold tracking-tight first:mt-0 sm:text-4xl">
                {children}
            </h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-foreground mb-4 mt-12 text-2xl font-semibold tracking-tight">{children}</h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-foreground mb-3 mt-8 text-xl font-semibold tracking-tight">{children}</h3>
        ),
        p: ({ children }) => <p className="text-foreground/90 my-5 text-base leading-relaxed">{children}</p>,
        ul: ({ children }) => (
            <ul className="text-foreground/90 my-5 list-disc space-y-2 pl-6 text-base leading-relaxed">{children}</ul>
        ),
        ol: ({ children }) => (
            <ol className="text-foreground/90 my-5 list-decimal space-y-2 pl-6 text-base leading-relaxed">
                {children}
            </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        blockquote: ({ children }) => (
            <blockquote className="border-grade-a/40 text-foreground/80 my-6 border-l-4 pl-4 italic">
                {children}
            </blockquote>
        ),
        a: ({ href, children }) => {
            const url = href ?? '#';
            const isExternal = /^https?:/.test(url);
            if (isExternal) {
                return (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-grade-a underline-offset-4 hover:underline"
                    >
                        {children}
                    </a>
                );
            }
            return (
                <Link href={url} className="text-grade-a underline-offset-4 hover:underline">
                    {children}
                </Link>
            );
        },
        hr: () => <hr className="border-border my-10" />,
        code: ({ children }) => (
            <code className="bg-muted text-foreground rounded-md px-1.5 py-0.5 font-mono text-sm">{children}</code>
        ),
        ...components,
    };
}
