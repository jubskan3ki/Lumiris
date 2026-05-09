import { useMemo } from 'react';
import type { CertificationRef, Passport } from '@lumiris/types';

export function useUniqueCertificates(passport: Passport): readonly CertificationRef[] {
    return useMemo(() => {
        const seen = new Set<string>();
        const out: CertificationRef[] = [];
        for (const m of passport.materials) {
            for (const c of m.certifications) {
                if (seen.has(c.id)) continue;
                seen.add(c.id);
                out.push(c);
            }
        }
        for (const c of passport.certifications) {
            if (seen.has(c.id)) continue;
            seen.add(c.id);
            out.push(c);
        }
        return out;
    }, [passport]);
}
