export interface MockKpi {
    verificationQueueSize: number;
    dataIntegrityScore: number;
    activeScans: number;
    systemLatency: number;
    flaggedAnomalies: number;
    certificatesExpiringSoon: number;
}

export const mockKpi: MockKpi = {
    verificationQueueSize: 147,
    dataIntegrityScore: 94.7,
    activeScans: 3842,
    systemLatency: 12,
    flaggedAnomalies: 23,
    certificatesExpiringSoon: 8,
};
