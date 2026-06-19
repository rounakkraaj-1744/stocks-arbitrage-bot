import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DrawdownChart({ data }: { data: any[] }) {
    if (!data || data.length === 0)
        return <div className="text-slate-400 text-sm">No data for Drawdown Curve</div>;
    
    const keys = Object.keys(data[0]).filter(k => k !== 'day');
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#06b6d4'];

    return (
        <div className="w-full h-64 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 mt-4">
            <h3 className="text-white text-sm font-semibold mb-4">Monte Carlo Drawdown Curves</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" tick={{fontSize: 12}} />
                    <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(value) => `${value.toFixed(1)}%`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    {keys.map((key, idx) => (
                        <Area 
                            key={key} 
                            type="monotone" 
                            dataKey={key} 
                            stroke={colors[idx % colors.length]} 
                            fill={colors[idx % colors.length]}
                            fillOpacity={0.1}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
