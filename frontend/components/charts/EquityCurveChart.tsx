import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function EquityCurveChart({ data }: { data: any[] }) {
    if (!data || data.length === 0)
        return <div className="text-slate-400 text-sm">No data for Equity Curve</div>;
    
    const keys = Object.keys(data[0]).filter(k => k !== 'day');
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

    return (
        <div className="w-full h-64 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-white text-sm font-semibold mb-4">Monte Carlo Equity Curves</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" tick={{fontSize: 12}} />
                    <YAxis stroke="#94a3b8" tick={{fontSize: 12}} domain={['dataMin', 'dataMax']} tickFormatter={(value) => `₹${(value/1000).toFixed(1)}k`} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    {keys.map((key, idx) => (
                        <Line 
                            key={key} 
                            type="monotone" 
                            dataKey={key} 
                            stroke={colors[idx % colors.length]} 
                            dot={false}
                            strokeWidth={1.5}
                            opacity={0.8}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
