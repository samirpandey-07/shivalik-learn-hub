import { ResourceGrid } from '@/components/resources/ResourceGrid';
import { useAuth } from '@/contexts/useAuth';

export default function BrowsePage() {
	const { user, profile } = useAuth();

	// For public users, we might want to allow filtering too, 
	// but for now let's ensure it doesn't crash.
	// Ideally, valid public browsing should rely on URL params or a global selection.

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold tracking-tight">Browse Resources</h1>
				<p className="text-muted-foreground">
					Explore study materials from across the platform.
				</p>
			</div>

			<ResourceGrid
				collegeId={profile?.college_id}
				courseId={profile?.course_id}
			// yearId is omitted so it defaults to "All Years"
			/>
		</div>
	);
}
