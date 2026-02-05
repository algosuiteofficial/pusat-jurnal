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

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isProfit = data.tradePnl >= 0;

        return (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3 border-b border-slate-800/50 pb-2">
                    {data.fullDate}
                </p>
                <div className="space-y-2">
                    <div className="flex justify-between gap-6 items-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Saldo Akun</span>
                        <span className="text-white font-mono font-bold text-sm">
                            {data.pnl.toLocaleString('id-ID')} <span className="text-[10px] text-slate-500 font-normal">cent</span>
                        </span>
                    </div>
                    <div className="flex justify-between gap-6 items-center">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Hasil Trade</span>
                        <span className={`font-mono font-bold text-sm ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
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
        const sorted = [...trades].sort((a, b) => {
            const dateDiff = new Date(a.date) - new Date(b.date);
            if (dateDiff !== 0) return dateDiff;
            return (a.id || 0) - (b.id || 0);
        });

        let cumulative = parseFloat(initialBalance);
        let lastDate = '';

        const data = [{
            index: 0,
            name: 'START',
            fullDate: 'Saldo Awal Akun',
            pnl: parseFloat(cumulative.toFixed(2)),
            tradePnl: 0
        }];

        sorted.forEach((trade, idx) => {
            cumulative += parseFloat(trade.pnlCent || 0);
            const currentDate = new Date(trade.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

            data.push({
                index: idx + 1,
                // Only show date if it's different from the previous one to avoid clutter
                name: currentDate === lastDate ? '' : currentDate,
                fullDate: new Date(trade.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) + ` (Trade #${idx + 1})`,
                pnl: parseFloat(cumulative.toFixed(2)),
                tradePnl: parseFloat(parseFloat(trade.pnlCent || 0).toFixed(2))
            });
            lastDate = currentDate;
        });

        return data;
    }, [trades, initialBalance]);

    if (trades.length < 1) {
        return (
            <div className="h-[350px] flex items-center justify-center bg-slate-900/20 rounded-[2rem] border border-slate-800/50 border-dashed text-slate-600 italic text-[10px] uppercase tracking-[0.3em] font-black">
                BELUM ADA DATA TRANSAKSI
            </div>
        );
    }

    return (
        <div className="h-[350px] w-full mt-6 -ml-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <defs>
                        <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="10 10" stroke="#1e293b" vertical={false} opacity={0.3} />
                    <XAxis
                        dataKey="name"
                        stroke="#475569"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        fontFamily="monospace"
                    />
                    <YAxis
                        stroke="#475569"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString('id-ID')}
                        fontFamily="monospace"
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="pnl"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorPnL)"
                        animationDuration={1500}
                        dot={{ r: 3, fill: '#050810', stroke: '#3b82f6', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EquityChart;
