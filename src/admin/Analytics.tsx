import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase/client';

export function Analytics() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6); // Last 7 days

        // Initialize days map
        const daysMap = new Map<string, { name: string, downloads: number, uploads: number }>();
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            daysMap.set(dayName, { name: dayName, downloads: 0, uploads: 0 });
        }

        try {
            // Fetch Uploads (Resources created_at)
            const { data: uploads } = await supabase
                .from('resources')
                .select('created_at')
                .gte('created_at', startDate.toISOString());

            // Fetch Downloads (User Activity 'download')
            const { data: downloads } = await supabase
                .from('user_activity')
                .select('created_at')
                .eq('action', 'download')
                .gte('created_at', startDate.toISOString());

            // Process Uploads
            uploads?.forEach(item => {
                const dayName = new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'short' });
                if (daysMap.has(dayName)) {
                    const entry = daysMap.get(dayName)!;
                    entry.uploads++;
                }
            });

            // Process Downloads
            downloads?.forEach(item => {
                const dayName = new Date(item.created_at).toLocaleDateString('en-US', { weekday: 'short' });
                if (daysMap.has(dayName)) {
                    const entry = daysMap.get(dayName)!;
                    entry.downloads++;
                }
            });

            setData(Array.from(daysMap.values()));

        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Platform Activity (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                Loading analytics...
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Bar dataKey="downloads" fill="#8884d8" name="Downloads" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="uploads" fill="#82ca9d" name="Uploads" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
