// Apps should prefer granular subpath imports (e.g. './components/iris-grade') for tree-shaking; this barrel is for package-internal re-exports.

export { IrisGrade, type IrisGradeProps, type IrisGradeSize, type IrisGradeTone } from './components/iris-grade';
export { ScoreBreakdown, type ScoreBreakdownProps } from './components/score-breakdown';
export { ScoreReasonsList, type ScoreReasonsListProps } from './components/score-reasons-list';
export { MissingFieldsBadge, type MissingFieldsBadgeProps } from './components/missing-fields-badge';
export {
    StatusBadge,
    type StatusBadgeProps,
    type StatusBadgeSize,
    type LumirisStatus,
} from './components/status-badge';
export { Wardrobe, type WardrobeProps, type WardrobeItem } from './components/wardrobe';

export {
    GRADE_COLOR,
    GRADE_LABEL,
    gradeColor,
    gradeBackground,
    gradeBackgroundSolid,
    gradeBorder,
    type GradeColorToken,
} from './theme/grade-color';
