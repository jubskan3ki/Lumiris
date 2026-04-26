/**
 * LUMIRIS Scoring UI — visual primitives bound to the 50/30/20 algorithm.
 *
 * Apps should prefer the granular subpaths (e.g. `@lumiris/scoring-ui/components/iris-grade`)
 * for tree-shaking; the barrel exists for ergonomic re-exports inside packages.
 */

export { IrisGrade, type IrisGradeProps, type IrisGradeSize } from './components/iris-grade';
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

export { GRADE_COLOR, gradeColor, gradeBackground, gradeBorder, type GradeColorToken } from './theme/grade-color';
