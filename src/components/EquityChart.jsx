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

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isProfit = data.tradePnl >= 0;

        return (
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
                    {data.fullDate || label}
                </p>
                <div className="space-y-1.5">
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-400 text-[10px] font-medium">Saldo Akun:</span>
                        <span className="text-white font-mono font-bold text-xs">{data.pnl.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-slate-400 text-[10px] font-medium">Laba/Rugi:</span>
                        <span className={`font-mono font-bold text-xs ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isProfit ? '+' : ''}{data.tradePnl.toLocaleString('id-ID')}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const EquityChart = ({ trades, initialBalance = 0 }) => {
    const chartData = useMemo(() => {
        // 1. Sort precisely: Date first, then ID
        const sorted = [...trades].sort((a, b) => {
            const dateDiff = new Date(a.date) - new Date(b.date);
            if (dateDiff !== 0) return dateDiff;
            return (a.id || 0) - (b.id || 0);
        });

        let cumulative = parseFloat(initialBalance);

        // Add starting point
        const data = [{
            id: 'start',
            name: 'Start',
            fullDate: 'Saldo Awal',
            pnl: parseFloat(cumulative.toFixed(2)),
            tradePnl: 0
        }];

        sorted.forEach((trade) => {
            cumulative += parseFloat(trade.pnlCent || 0);
            data.push({
                id: trade.id,
                name: new Date(trade.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                fullDate: new Date(trade.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
                pnl: parseFloat(cumulative.toFixed(2)),
                tradePnl: parseFloat(parseFloat(trade.pnlCent || 0).toFixed(2))
            });
        });

        return data;
    }, [trades, initialBalance]);

    if (trades.length < 1) {
        return (
            <div className="h-[300px] flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed text-slate-500 italic text-xs uppercase tracking-widest font-bold">
                Masukkan transaksi untuk melihat kurva ekuitas
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                    <XAxis
                        dataKey="name"
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        stroke="#475569"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString('id-ID')}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="pnl"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPnL)"
                        animationDuration={1000}
                        activeDot={{ r: 6, stroke: '#050810', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EquityChart;
