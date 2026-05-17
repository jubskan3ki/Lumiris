import { WorkspaceShell } from '@/features/workspace-shell';
import { AuthGuard } from './auth-guard';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <WorkspaceShell>{children}</WorkspaceShell>
        </AuthGuard>
    );
}
