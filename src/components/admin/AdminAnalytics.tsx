import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export function AdminAnalytics() {
    const [data, setData] = useState<{ name: string; uploads: number; users: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Limit to last 7 days
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 6); // 7 days inclusive
                const isoDate = startDate.toISOString();

                // 1. Fetch Resources
                const { data: resources } = await supabase
                    .from('resources')
                    .select('created_at')
                    .gte('created_at', isoDate);

                // 2. Fetch Users (Profiles)
                const { data: users } = await supabase
                    .from('profiles')
                    .select('created_at') // Assuming profiles has created_at, if not we might fallback or skip
                    .gte('created_at', isoDate);

                // 3. Aggregate by Date
                const dayMap = new Map<string, { uploads: number; users: number }>();

                // Initialize last 7 days in map to ensure 0s
                for (let i = 0; i < 7; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const key = d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon"
                    dayMap.set(key, { uploads: 0, users: 0 });
                }

                // Helper to fill map
                const processDates = (items: any[], type: 'uploads' | 'users') => {
                    items?.forEach(item => {
                        const date = new Date(item.created_at);
                        const key = date.toLocaleDateString('en-US', { weekday: 'short' });
                        if (dayMap.has(key)) {
                            const entry = dayMap.get(key)!;
                            entry[type]++;
                        } else {
                            // If date aggregation is slightly off (timezone), usually just ignore or map to nearest
                            // Ideally we sort the array properly below
                        }
                    });
                };

                processDates(resources || [], 'uploads');
                processDates(users || [], 'users');

                // Convert Map to Array and Sort (Reverse Chronological fix)
                // Actually, let's rebuild the array in order: T-6, T-5 ... Today
                const chartData = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const key = d.toLocaleDateString('en-US', { weekday: 'short' });
                    const entry = dayMap.get(key) || { uploads: 0, users: 0 };
                    chartData.push({ name: key, ...entry });
                }

                setData(chartData);

            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <Card className="col-span-1 md:col-span-2 border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
            </Card>
        );
    }

    return (
        <Card className="col-span-1 md:col-span-2 border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-white">Activity Overview (Last 7 Days)</CardTitle>
                <CardDescription className="text-slate-400">Real-time platform growth</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="uploads" name="Resources" stroke="#8884d8" fillOpacity={1} fill="url(#colorUploads)" />
                            <Area type="monotone" dataKey="users" name="New Users" stroke="#82ca9d" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
