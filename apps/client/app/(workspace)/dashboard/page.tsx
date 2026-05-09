import { WorkspaceHeader } from '@/features/workspace-header';
import { Dashboard } from '@/features/dashboard';

export default function DashboardPage() {
    return (
        <>
            <WorkspaceHeader
                title="Tableau de bord"
                description="Vue d'ensemble de vos passeports et de votre score Iris."
            />
            <Dashboard />
        </>
    );
}
