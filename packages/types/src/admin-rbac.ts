// admin RBAC - distinct de `User.role` (consumer/artisan), modélise l'identité back-office

export type AdminUserRole = 'curator' | 'lead_curator' | 'content_manager' | 'billing_ops' | 'platform_admin' | 'dpo';

export type AdminAction =
    | 'passport.read'
    | 'passport.curate'
    | 'passport.flag'
    | 'passport.request_changes'
    | 'passport.override_score'
    | 'artisan.read'
    | 'artisan.suspend'
    | 'artisan.contact'
    | 'retoucheur.read'
    | 'retoucheur.verify_kyc'
    | 'retoucheur.suspend'
    | 'retoucheur.review_moderate'
    | 'vision_user.read'
    | 'vision_user.export_rgpd'
    | 'vision_user.erase_rgpd'
    | 'billing.read'
    | 'billing.dunning'
    | 'billing.export'
    | 'affiliation.read'
    | 'affiliation.prepare_payout'
    | 'blog.read'
    | 'blog.publish'
    | 'blog.archive'
    | 'governance.read_audit_log'
    | 'governance.export_audit_log';

export interface AdminUser {
    id: string;
    email: string;
    fullName: string;
    role: AdminUserRole;
    avatarUrl?: string;
    createdAt: string;
    lastSeenAt?: string;
}

export interface AdminAuditLogEntry {
    id: string;
    ts: string;
    actorId: string;
    actorRole: AdminUserRole;
    action: AdminAction;
    targetType: string;
    targetId: string;
    payload: Record<string, unknown>;
    ipMock?: string;
}
