import { ResourceGrid } from '@/components/resources/ResourceGrid';
import { useAuth } from '@/contexts/useAuth';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function BrowsePage() {
	const { user, profile } = useAuth();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState<string | null>(null);

	const resourceTypes = [
		{ id: 'notes', label: 'Notes', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
		{ id: 'pyq', label: 'PYQs', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
		{ id: 'video', label: 'Videos', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
		{ id: 'link', label: 'External Links', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
	];

	return (
		<div className="space-y-8">
			{/* Header Section */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-white/70">Browse Resources</h1>
					<p className="text-muted-foreground mt-1">
						Explore study materials from across the platform.
					</p>
				</div>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex flex-col md:flex-row gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search by title, subject, or topic..."
						className="pl-10 h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 focus:border-primary/50 text-foreground dark:text-white placeholder:text-muted-foreground/50 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-white/10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				{/* Year Filter can go here later */}
			</div>

			{/* Category Filters */}
			<div className="flex flex-wrap gap-2">
				<Button
					variant="ghost"
					className={`rounded-full border ${!selectedType ? 'bg-slate-100 dark:bg-white/10 text-foreground dark:text-white border-slate-200 dark:border-white/20' : 'border-transparent text-muted-foreground hover:text-foreground dark:hover:text-white'}`}
					onClick={() => setSelectedType(null)}
				>
					All Resources
				</Button>
				{resourceTypes.map(type => (
					<Button
						key={type.id}
						variant="ghost"
						className={`rounded-full border transition-all ${selectedType === type.id ? type.color : 'border-transparent text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/5'}`}
						onClick={() => setSelectedType(type.id === selectedType ? null : type.id)}
					>
						{type.label}
					</Button>
				))}
			</div>

			<ResourceGrid
				collegeId={profile?.college_id}
				courseId={profile?.course_id}
				searchQuery={searchQuery}
				typeFilter={selectedType}
				hideFilters={true}
			/>
		</div>
	);
}
