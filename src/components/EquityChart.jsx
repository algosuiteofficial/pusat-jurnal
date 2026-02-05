import React, { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Maximize2, Filter, TrendingUp, Calendar } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isProfit = data.tradePnl >= 0;

        return (
            <div className="bg-slate-900/90 border border-slate-700/50 p-4 rounded-xl shadow-2xl backdrop-blur-md min-w-[200px]">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/50">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                        {data.fullDate}
                    </p>
                    {data.tradePnl !== 0 && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {isProfit ? 'WIN' : 'LOSS'}
                        </span>
                    )}
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between gap-8 items-center group">
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider group-hover:text-blue-400 transition-colors">Saldo Akun</span>
                        <span className="text-white font-mono font-bold text-sm">
                            {data.pnl.toLocaleString('id-ID')} <span className="text-[9px] text-slate-600 font-normal">c</span>
                        </span>
                    </div>
                    <div className="flex justify-between gap-8 items-center group">
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider group-hover:text-slate-300 transition-colors">PnL Trade</span>
                        <div className="flex items-center gap-2">
                            {data.tradePnl !== 0 && (
                                <div className={`w-1.5 h-1.5 rounded-full ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                            )}
                            <span className={`font-mono font-bold text-sm ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isProfit ? '+' : ''}{data.tradePnl.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

const EquityChart = ({ trades, initialBalance = 0 }) => {
    const [timeframe, setTimeframe] = useState('ALL'); // ALL, 1M, 1W

    const chartData = useMemo(() => {
        // 1. Sort Data
        const sorted = [...trades].sort((a, b) => {
            const dateDiff = new Date(a.date) - new Date(b.date);
            if (dateDiff !== 0) return dateDiff;
            return (a.id || 0) - (b.id || 0);
        });

        // 2. Build Cumulative Data
        let cumulative = parseFloat(initialBalance);
        let lastDate = '';

        const fullData = [{
            id: 'start',
            dateObj: new Date(0), // Old date for start
            name: 'START',
            fullDate: 'Saldo Awal',
            pnl: parseFloat(cumulative.toFixed(2)),
            tradePnl: 0
        }];

        sorted.forEach((trade, idx) => {
            cumulative += parseFloat(trade.pnlCent || 0);
            const outputDate = new Date(trade.date);
            const dateStr = outputDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

            fullData.push({
                id: trade.id,
                dateObj: outputDate,
                name: dateStr === lastDate ? '' : dateStr,
                fullDate: outputDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }) + ` (#${idx + 1})`,
                pnl: parseFloat(cumulative.toFixed(2)),
                tradePnl: parseFloat(parseFloat(trade.pnlCent || 0).toFixed(2))
            });
            lastDate = dateStr;
        });

        // 3. Filter by Timeframe
        if (timeframe === 'ALL') return fullData;

        const now = new Date();
        let filterDate = new Date();
        if (timeframe === '1W') filterDate.setDate(now.getDate() - 7);
        if (timeframe === '1M') filterDate.setDate(now.getDate() - 30);

        // Find the first trade that satisfies the filter
        const firstTradeIndex = fullData.findIndex(d => d.id !== 'start' && d.dateObj >= filterDate);

        // If no data in range or all data is in range
        if (firstTradeIndex === -1) return [fullData[0]]; // Return just start if empty
        if (firstTradeIndex <= 1) return fullData; // Just show all if it's practically the start

        // The "Opening Balance" for this period is the PnL of the point immediately preceding the window
        const previousPoint = fullData[firstTradeIndex - 1];

        // Create a new "Start" point for this zoomed view
        const viewStart = {
            ...previousPoint,
            name: 'OPEN',
            fullDate: 'Awal Periode',
            tradePnl: 0,
            id: 'view_start'
        };

        return [viewStart, ...fullData.slice(firstTradeIndex)];

    }, [trades, initialBalance, timeframe]);


    // Statistics for Domain & Gradient
    const minPnl = Math.min(...chartData.map(d => d.pnl));
    const maxPnl = Math.max(...chartData.map(d => d.pnl));
    const buffer = (maxPnl - minPnl) * 0.15; // 15% buffer

    // High Water Mark
    const highWaterMark = maxPnl;

    // Gradient Offset Calculation
    const gradientOffset = () => {
        if (maxPnl <= initialBalance) return 0; // All Red
        if (minPnl >= initialBalance) return 1; // All Green
        return (maxPnl - initialBalance) / (maxPnl - minPnl); // Split
    };

    const off = gradientOffset();

    return (
        <div className="relative group">
            {/* Header Controls */}
            <div className="absolute top-0 right-0 z-10 flex gap-1 p-2">
                {['1W', '1M', 'ALL'].map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`text-[9px] font-bold px-3 py-1.5 rounded-lg transition-all border ${timeframe === tf
                            ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                            : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        {tf}
                    </button>
                ))}
            </div>

            {/* Background Glow */}
            <div className={`absolute inset-0 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-1000 -z-10 ${chartData[chartData.length - 1]?.pnl >= initialBalance ? 'bg-emerald-500/5' : 'bg-rose-500/5'
                }`}></div>

            <div className="h-[350px] w-full mt-8 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset={0} stopColor="#10b981" stopOpacity={0.4} /> {/* Emerald Top */}
                                <stop offset={off} stopColor="#10b981" stopOpacity={0} />
                                <stop offset={off} stopColor="#f43f5e" stopOpacity={0} />
                                <stop offset={1} stopColor="#f43f5e" stopOpacity={0.4} /> {/* Rose Bottom */}
                            </linearGradient>
                            <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                                <stop offset={0} stopColor="#34d399" stopOpacity={1} />
                                <stop offset={off} stopColor="#34d399" stopOpacity={1} />
                                <stop offset={off} stopColor="#fb7185" stopOpacity={1} />
                                <stop offset={1} stopColor="#fb7185" stopOpacity={1} />
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />

                        <XAxis
                            dataKey="name"
                            stroke="#64748b"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            fontFamily="monospace"
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={9}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value.toLocaleString('id-ID')}
                            fontFamily="monospace"
                            domain={[minPnl - buffer, maxPnl + buffer]}
                            width={50}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />

                        {/* Break Even Line */}
                        <ReferenceLine
                            y={initialBalance}
                            stroke="#64748b"
                            strokeDasharray="3 3"
                            opacity={0.5}
                            label={{ position: 'insideTopRight', value: 'BEP', fill: '#64748b', fontSize: 9, fontWeight: 'bold' }}
                        />

                        {/* High Water Mark (Only show if significant profit) */}
                        {highWaterMark > initialBalance && (
                            <ReferenceLine
                                y={highWaterMark}
                                stroke="#10b981"
                                strokeDasharray="2 2"
                                opacity={0.3}
                                label={{ position: 'insideBottomRight', value: 'ATH', fill: '#10b981', fontSize: 9, fontWeight: 'bold' }}
                            />
                        )}

                        <Area
                            type="monotone"
                            dataKey="pnl"
                            stroke="url(#splitStroke)"
                            strokeWidth={3}
                            fill="url(#splitColor)"
                            animationDuration={1500}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EquityChart;
