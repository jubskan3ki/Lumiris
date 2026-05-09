export type CandidatureStatus = 'pending' | 'verified' | 'rejected';

export interface RepairerOverlay {
    candidatureStatus?: CandidatureStatus;
    rejectReason?: string;
    hiddenReviewIds?: readonly string[];
}
