/**
 * Identity model shared by admin, web, and mobile.
 */

export type UserRole = 'auditor' | 'lead_auditor' | 'content_manager' | 'admin' | 'consumer';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    createdAt: string;
    lastSeenAt?: string;
}

export interface AuditorProfile extends User {
    role: 'auditor' | 'lead_auditor';
    verifiedDPPs: number;
    flaggedAnomalies: number;
}

export interface ConsumerProfile extends User {
    role: 'consumer';
    scannedProducts: string[];
}
