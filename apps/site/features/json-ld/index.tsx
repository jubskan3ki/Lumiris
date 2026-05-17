interface JsonLdProps {
    data: Record<string, unknown>;
}

// Single chokepoint for schema.org JSON-LD. The Next.js canonical pattern requires
// dangerouslySetInnerHTML to keep the JSON payload byte-identical (React would HTML-escape
// children of <script>). `react/no-danger` is disabled for this file only via eslint.config.mjs.
export function JsonLd({ data }: JsonLdProps) {
    return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
