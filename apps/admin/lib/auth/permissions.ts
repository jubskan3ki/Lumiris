'use client';

import type { AdminAction, AdminUserRole } from '@lumiris/types';
import { useCurrentUser } from './current-user';

// Permission matrix - backend-ready. Source of truth for who can do what in the back-office.
// Mirrored on the server when @lumiris/api-client lands; for now everything is enforced client-side.
const ROLE_PERMISSIONS: Record<AdminUserRole, ReadonlySet<AdminAction>> = {
    // "Personne n'achète son score" - curator peut valider, demander des changements et flagger
    // une anomalie, mais l'override de score est délibérément exclu (réservé lead_curator + platform_admin).
    curator: new Set<AdminAction>([
        'passport.read',
        'passport.curate',
        'passport.flag',
        'passport.request_changes',
        'artisan.read',
        'artisan.contact',
        'governance.read_audit_log',
    ]),
    lead_curator: new Set<AdminAction>([
        'passport.read',
        'passport.curate',
        'passport.flag',
        'passport.request_changes',
        'passport.override_score',
        'artisan.read',
        'artisan.contact',
        'governance.read_audit_log',
    ]),
    content_manager: new Set<AdminAction>(['blog.read', 'blog.publish', 'blog.archive', 'artisan.read']),
    billing_ops: new Set<AdminAction>([
        'billing.read',
        'billing.dunning',
        'billing.export',
        'affiliation.read',
        'affiliation.prepare_payout',
        'artisan.read',
        'retoucheur.read',
    ]),
    platform_admin: new Set<AdminAction>([
        'passport.read',
        'passport.curate',
        'passport.flag',
        'passport.request_changes',
        'passport.override_score',
        'artisan.read',
        'artisan.suspend',
        'artisan.contact',
        'retoucheur.read',
        'retoucheur.verify_kyc',
        'retoucheur.suspend',
        'retoucheur.review_moderate',
        'vision_user.read',
        'vision_user.export_rgpd',
        'vision_user.erase_rgpd',
        'billing.read',
        'billing.dunning',
        'billing.export',
        'affiliation.read',
        'affiliation.prepare_payout',
        'blog.read',
        'blog.publish',
        'blog.archive',
        'governance.read_audit_log',
        'governance.export_audit_log',
    ]),
    dpo: new Set<AdminAction>([
        'vision_user.read',
        'vision_user.export_rgpd',
        'vision_user.erase_rgpd',
        'governance.read_audit_log',
        'governance.export_audit_log',
    ]),
};

export function can(role: AdminUserRole, action: AdminAction): boolean {
    return ROLE_PERMISSIONS[role].has(action);
}

export function usePermission(action: AdminAction): boolean {
    const user = useCurrentUser();
    return can(user.role, action);
}
