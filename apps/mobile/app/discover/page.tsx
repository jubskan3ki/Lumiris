import { Discover } from '@/features/discover';
import { getDiscoverFeed } from '@/lib/discover/feed';

// Server component - `getDiscoverFeed()` est exécuté au build (statique) et passé en props,
// pour respecter la contrainte « feed server-side rendu, pas de useEffect ».
export default function DiscoverPage() {
    return <Discover items={getDiscoverFeed()} />;
}
