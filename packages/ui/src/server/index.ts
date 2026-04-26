/**
 * @lumiris/ui — server-only surface.
 *
 * Reserved for primitives that must run on the React Server runtime — typically
 * components that read environment variables at build time, query a build-time
 * data source, or otherwise cannot ship `'use client'` boundaries.
 *
 * Do NOT add `'use client'` files here. Anything client-interactive belongs in
 * `@lumiris/ui/components/*`. This module is intentionally thin until a real
 * server primitive is needed.
 */

export {};
