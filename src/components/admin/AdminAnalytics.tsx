import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminAnalytics() {
    const data = [
        { name: 'Mon', uploads: 4, users: 10 },
        { name: 'Tue', uploads: 3, users: 15 },
        { name: 'Wed', uploads: 7, users: 8 },
        { name: 'Thu', uploads: 2, users: 12 },
        { name: 'Fri', uploads: 6, users: 20 },
        { name: 'Sat', uploads: 5, users: 5 },
        { name: 'Sun', uploads: 8, users: 7 },
    ];

    return (
        <Card className="col-span-1 md:col-span-2 border-white/10 bg-white/5 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="text-white">Activity Overview</CardTitle>
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
                            <Area type="monotone" dataKey="uploads" stroke="#8884d8" fillOpacity={1} fill="url(#colorUploads)" />
                            <Area type="monotone" dataKey="users" stroke="#82ca9d" fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
