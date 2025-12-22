import { ResourceGrid } from '@/components/resources/ResourceGrid';
import { useAuth } from '@/contexts/useAuth';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, Video, Link, ChevronDown, Check } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSubjects, useYears, useGlobalYearNumbers } from '@/hooks/useResources';
import { VoiceRecorder } from '@/components/ai/VoiceRecorder';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

type SortOption = "recent" | "popular" | "rating";

export default function BrowsePage() {
	const [searchParams] = useSearchParams();
	const { user, profile } = useAuth();
	const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

	useEffect(() => {
		setSearchQuery(searchParams.get("search") || "");
	}, [searchParams]);
	const [selectedType, setSelectedType] = useState<string | null>(null);
	const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
	const [sortBy, setSortBy] = useState<SortOption>("recent");
	const [filterScope, setFilterScope] = useState<'all' | 'my_course'>('all');

	// State for filtering
	const [selectedYear, setSelectedYear] = useState<string | null>(null); // For ID-based filtering (My Course)
	const [selectedYearNumber, setSelectedYearNumber] = useState<number | null>(null); // For Number-based filtering (Global)

	const { subjects } = useSubjects();
	// Fetch context-specific years (IDs)
	const { years } = useYears(filterScope === 'my_course' ? profile?.course_id || null : null);
	// Fetch global year numbers
	const { yearNumbers } = useGlobalYearNumbers();

	// Reset selected year when scope changes
	useEffect(() => {
		setSelectedYear(null);
		setSelectedYearNumber(null);
	}, [filterScope]);

	const resourceTypes = [
		{ id: 'notes', label: 'Notes', activeClass: 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 hover:bg-purple-700', icon: FileText },
		{ id: 'pyq', label: 'PYQs', activeClass: 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700', icon: FileText },
		{ id: 'video', label: 'Videos', activeClass: 'bg-red-600 text-white shadow-lg shadow-red-500/25 hover:bg-red-700', icon: Video },
		{ id: 'link', label: 'External Links', activeClass: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700', icon: Link },
	];

	return (
		<div className="space-y-8 pb-10">
			{/* Header Section */}
			<div className="relative overflow-hidden rounded-3xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-8 md:p-12 text-center">
				<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:to-purple-500/20 pointer-events-none" />
				<div className="relative z-10 space-y-2">
					<h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground dark:text-white uppercase font-sans">
						Browse Resources
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Explore study materials across the platform. Find notes, PYQs, and videos to ace your exams.
					</p>
				</div>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex flex-col md:flex-row items-center gap-4 p-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm">
				<div className="relative flex-1 w-full flex items-center gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
						<Input
							placeholder="Search by title, subject, or topic..."
							className="pl-12 h-12 border-0 bg-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/70"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
					<VoiceRecorder onTranscript={setSearchQuery} variant="minimal" className="mr-2" />
				</div>
				<div className="flex items-center gap-2 w-full md:w-auto px-2">
					<div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 hidden md:block" />


					{/* Functional Filters */}

					{/* TYPE Filter */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="text-muted-foreground hover:text-foreground">
								{selectedType ? resourceTypes.find(t => t.id === selectedType)?.label : "Type"}
								<ChevronDown className="ml-1 h-3 w-3" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-[150px]">
							<DropdownMenuItem onClick={() => setSelectedType(null)}>
								All Types
								{!selectedType && <Check className="ml-auto h-4 w-4" />}
							</DropdownMenuItem>
							{resourceTypes.map(type => (
								<DropdownMenuItem key={type.id} onClick={() => setSelectedType(type.id)}>
									{type.label}
									{selectedType === type.id && <Check className="ml-auto h-4 w-4" />}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* YEAR Filter Logic 
                        - If My Course: Use 'years' (IDs)
                        - If Global: Use 'yearNumbers' (1, 2, 3...)
                    */}
					{(filterScope === 'my_course' ? years.length > 0 : yearNumbers.length > 0) && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="text-muted-foreground hover:text-foreground">
									{filterScope === 'my_course'
										? (selectedYear ? `Year ${years.find(y => y.id === selectedYear)?.year_number}` : "Year")
										: (selectedYearNumber ? `Year ${selectedYearNumber}` : "Year")
									}
									<ChevronDown className="ml-1 h-3 w-3" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-[150px]">
								<DropdownMenuItem onClick={() => { setSelectedYear(null); setSelectedYearNumber(null); }}>
									All Years
									{!selectedYear && !selectedYearNumber && <Check className="ml-auto h-4 w-4" />}
								</DropdownMenuItem>

								{/* My Course Scope: Year Objects */}
								{filterScope === 'my_course' && years.map(year => (
									<DropdownMenuItem key={year.id} onClick={() => setSelectedYear(year.id)}>
										Year {year.year_number}
										{selectedYear === year.id && <Check className="ml-auto h-4 w-4" />}
									</DropdownMenuItem>
								))}

								{/* Global Scope: Year Numbers */}
								{filterScope === 'all' && yearNumbers.map(num => (
									<DropdownMenuItem key={num} onClick={() => setSelectedYearNumber(num)}>
										Year {num}
										{selectedYearNumber === num && <Check className="ml-auto h-4 w-4" />}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					)}

					{/* SUBJECT Filter */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="text-muted-foreground hover:text-foreground max-w-[150px] truncate">
								{selectedSubject || "Subject"}
								<ChevronDown className="ml-1 h-3 w-3" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-[200px] max-h-[300px] overflow-y-auto">
							<DropdownMenuItem onClick={() => setSelectedSubject(null)}>
								All Subjects
								{!selectedSubject && <Check className="ml-auto h-4 w-4" />}
							</DropdownMenuItem>
							{subjects.map(subject => (
								<DropdownMenuItem key={subject} onClick={() => setSelectedSubject(subject)}>
									{subject}
									{selectedSubject === subject && <Check className="ml-auto h-4 w-4" />}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* SORT Filter */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="text-muted-foreground hover:text-foreground">
								{sortBy === 'recent' ? 'Newest' : sortBy === 'popular' ? 'Popular' : 'Rated'}
								<ChevronDown className="ml-1 h-3 w-3" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-[150px]">
							<DropdownMenuItem onClick={() => setSortBy('recent')}>
								Newest First
								{sortBy === 'recent' && <Check className="ml-auto h-4 w-4" />}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setSortBy('popular')}>
								Most Popular
								{sortBy === 'popular' && <Check className="ml-auto h-4 w-4" />}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => setSortBy('rating')}>
								Highest Rated
								{sortBy === 'rating' && <Check className="ml-auto h-4 w-4" />}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className="flex flex-col md:flex-row items-center justify-between gap-4">
				{/* Category Filters (Tabs) */}
				<div className="flex flex-wrap gap-2 justify-center md:justify-start flex-1">
					<Button
						size="sm"
						variant={!selectedType ? "default" : "outline"}
						className={`rounded-full px-6 transition-all ${!selectedType ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground'}`}
						onClick={() => setSelectedType(null)}
					>
						All
					</Button>
					{resourceTypes.map(type => (
						<Button
							key={type.id}
							size="sm"
							variant={selectedType === type.id ? "default" : "outline"}
							className={`rounded-full px-6 transition-all ${selectedType === type.id ? type.activeClass : 'text-muted-foreground'}`}
							onClick={() => setSelectedType(type.id === selectedType ? null : type.id)}
						>
							{type.icon && <type.icon className="w-3 h-3 mr-2" />}
							{type.label}
						</Button>
					))}
				</div>

				{/* Scope Toggle */}
				<div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-white/10">
					<Button
						size="sm"
						variant={filterScope === 'all' ? "secondary" : "ghost"}
						onClick={() => setFilterScope('all')}
						className="text-xs font-medium"
					>
						Global
					</Button>
					<Button
						size="sm"
						variant={filterScope === 'my_course' ? "secondary" : "ghost"}
						onClick={() => {
							if (!profile?.course_id) {
								toast.error("Please complete your profile details (Course & College) to use this filter.");
								return;
							}
							setFilterScope('my_course');
						}}
						className="text-xs font-medium"
					>
						My Course
					</Button>
				</div>
			</div>

			{/* Debug Info (Hidden in Prod) */}


			<ErrorBoundary componentName="Resource Grid">
				<ResourceGrid
					collegeId={filterScope === 'my_course'
						? (typeof profile?.college_id === 'object' ? (profile.college_id as any).id : profile?.college_id)
						: undefined}
					courseId={filterScope === 'my_course'
						? (typeof profile?.course_id === 'object' ? (profile.course_id as any).id : profile?.course_id)
						: undefined}
					yearId={selectedYear || undefined}
					yearNumber={selectedYearNumber || undefined}
					searchQuery={searchQuery}
					typeFilter={selectedType}
					subjectFilter={selectedSubject}
					sortBy={sortBy}
					hideFilters={true}
				/>
			</ErrorBoundary>
		</div>
	);
}
