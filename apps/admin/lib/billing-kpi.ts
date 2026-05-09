import type { Subscription } from '@lumiris/types';
import type { MrrPoint } from '@lumiris/mock-data';

interface BillingKpi {
    mrr: number;
    arr: number;
    churnPct: number;
    churnEur: number;
    netNew: number;
    split: { solo: number; studio: number; maison: number; plus: number; local: number };
}

export function computeBillingKpi(
    subscriptions: readonly Subscription[],
    mrrTrajectory: readonly MrrPoint[],
): BillingKpi {
    const active = subscriptions.filter((s) => s.status === 'active' || s.status === 'past_due');
    const mrr = active.reduce((sum, s) => sum + s.mrrEur, 0);
    const lastMonth = mrrTrajectory[mrrTrajectory.length - 2];
    const thisMonth = mrrTrajectory[mrrTrajectory.length - 1];
    const lastTotal = lastMonth
        ? lastMonth.solo + lastMonth.studio + lastMonth.maison + lastMonth.plus + lastMonth.local
        : 0;
    const thisTotal = thisMonth
        ? thisMonth.solo + thisMonth.studio + thisMonth.maison + thisMonth.plus + thisMonth.local
        : mrr;
    const netNew = thisTotal - lastTotal;
    const canceled = subscriptions.filter((s) => s.status === 'canceled');
    const churnEur = canceled.length === 0 ? 0 : canceled.length * 79;
    const churnPct = active.length === 0 ? 0 : (canceled.length / (active.length + canceled.length)) * 100;
    const arr = mrr * 12;
    const split = thisMonth ?? { solo: 0, studio: 0, maison: 0, plus: 0, local: 0 };
    return { mrr, arr, churnPct, churnEur, netNew, split };
}
