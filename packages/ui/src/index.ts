/**
 * LUMIRIS UI — Prismatic Clarity Design System.
 *
 * Apps should import primitives via the granular subpath exports
 * (e.g. `@lumiris/ui/components/button`) for tree-shaking; this barrel exists
 * for the small set of cross-cutting utilities that benefit from a single
 * import site.
 *
 * Server-only primitives live under `@lumiris/ui/server` — never import them
 * from this entry point or you risk pulling client React into an RSC tree.
 */

export { cn } from './lib/cn';
export { ThemeProvider } from './components/theme-provider';
export { useIsMobile } from './hooks/use-mobile';
export { useToast, toast } from './hooks/use-toast';
