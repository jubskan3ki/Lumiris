import { WorkspaceHeader } from '@/features/workspace-header';
import { WorkspaceProfile } from '@/features/workspace-profile';

export default function ProfilePage() {
    return (
        <>
            <WorkspaceHeader title="Profil atelier" description="Histoire, photo, spécialités, labels." />
            <WorkspaceProfile />
        </>
    );
}
