import React, { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const EquityChart = ({ trades }) => {
    const chartData = useMemo(() => {
        // Sort trades by date (ascending) for cumulative calculation
        const sorted = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

        let cumulative = 0;
        return sorted.map((trade, index) => {
            cumulative += parseFloat(trade.pnlCent || 0);
            return {
                name: new Date(trade.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                pnl: parseFloat(cumulative.toFixed(2)),
                tradePnl: trade.pnlCent
            };
        });
    }, [trades]);

    if (trades.length < 2) {
        return (
            <div className="h-[300px] flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed text-slate-500 italic">
                Add at least 2 trades to see the Equity Curve
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                        itemStyle={{ color: '#3b82f6' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="pnl"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPnL)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EquityChart;
