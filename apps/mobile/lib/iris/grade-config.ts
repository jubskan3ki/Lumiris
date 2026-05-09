// Grade config consommé par les écrans Vision (Wardrobe, Discover…). Ré-utilise
// les tokens de @lumiris/scoring-ui ; ajoute uniquement les libellés EN courts
// (B2C) que la version FR de scoring-ui ne couvre pas.
//
// Ne PAS dupliquer dans scoring-ui : ces labels sont propres à la surface mobile.

import { gradeBackground, gradeBackgroundSolid, gradeBorder, gradeColor } from '@lumiris/scoring-ui';
import type { IrisGrade } from '@lumiris/types';

const GRADE_LABEL_EN: Record<IrisGrade, string> = {
    A: 'Exceptional',
    B: 'Good',
    C: 'Average',
    D: 'Poor',
    E: 'Opaque',
};

interface GradeConfigEntry {
    /** CSS color reference (uses the prismatic CSS var so theme switches stay in sync). */
    color: string;
    label: string;
    cssClass: string;
    bgClass: string;
    bgSoftClass: string;
    borderClass: string;
}

export const GRADE_CONFIG: Record<IrisGrade, GradeConfigEntry> = {
    A: makeEntry('A'),
    B: makeEntry('B'),
    C: makeEntry('C'),
    D: makeEntry('D'),
    E: makeEntry('E'),
};

function makeEntry(grade: IrisGrade): GradeConfigEntry {
    return {
        color: `var(--iris-grade-${grade.toLowerCase()})`,
        label: GRADE_LABEL_EN[grade],
        cssClass: gradeColor(grade),
        bgClass: gradeBackgroundSolid(grade),
        bgSoftClass: gradeBackground(grade),
        borderClass: gradeBorder(grade),
    };
}
