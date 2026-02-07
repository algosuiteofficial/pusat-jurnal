import React, { useState, useMemo, useRef } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    ReferenceArea
} from 'recharts';
import { Maximize2, Filter, TrendingUp, Calendar, Download } from 'lucide-react';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isProfit = data.tradePnl >= 0;

        return (
            <div className="bg-white/10 border border-white/20 p-5 rounded-3xl shadow-2xl backdrop-blur-2xl min-w-[220px]">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-60">
                        {data.fullDate}
                    </p>
                    {data.tradePnl !== 0 && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-md font-black ${isProfit ? 'text-emerald-500 bg-emerald-500/5' : 'text-rose-500 bg-rose-500/5'}`}>
                            {isProfit ? 'WIN' : 'LOSS'}
                        </span>
                    )}
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Equity</span>
                        <span className="text-slate-800 font-mono font-black text-base tracking-tighter">
                            {data.pnl.toLocaleString('id-ID')} <span className="text-[9px] text-slate-400 opacity-60">c</span>
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Delta</span>
                        <span className={`font-mono font-black text-base tracking-tighter ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isProfit ? '+' : ''}{data.tradePnl.toLocaleString('id-ID')}
                        </span>
                    </div>
                    {data.drawdown !== undefined && data.drawdown > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t border-white/10">
                            <span className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] opacity-60">Drawdown</span>
                            <span className="font-mono font-black text-sm tracking-tighter text-amber-500">
                                -{data.drawdown.toLocaleString('id-ID')}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

const EquityChart = ({ trades, initialBalance = 0 }) => {
    const [timeframe, setTimeframe] = useState('ALL'); // ALL, 1M, 1W
    const chartRef = useRef(null);

    const exportChart = () => {
        // Use html2canvas to export the chart
        import('html2canvas').then((html2canvas) => {
            const chartElement = chartRef.current;
            if (chartElement) {
                html2canvas.default(chartElement, {
                    backgroundColor: '#ffffff',
                    scale: 2
                }).then((canvas) => {
                    const link = document.createElement('a');
                    link.download = `equity-chart-${new Date().toISOString().split('T')[0]}.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                });
            }
        }).catch(() => {
            alert('Export gagal. Silakan coba lagi.');
        });
    };

    const chartData = useMemo(() => {
        if (!trades || trades.length === 0) {
            return [{
                id: 'start',
                dateObj: new Date(),
                name: 'START',
                fullDate: 'Saldo Awal',
                pnl: parseFloat(initialBalance || 0),
                tradePnl: 0,
                drawdown: 0
            }];
        }

        // 1. Sort Data
        const sorted = [...trades].sort((a, b) => {
            const dateA = new Date(a.date || 0);
            const dateB = new Date(b.date || 0);
            const dateDiff = dateA - dateB;
            if (dateDiff !== 0) return dateDiff;
            return (a.id || 0) - (b.id || 0);
        });

        // 2. Build Cumulative Data with Drawdown Tracking
        let cumulative = parseFloat(initialBalance || 0);
        let highWaterMark = cumulative;
        let lastDate = '';

        const fullData = [{
            id: 'start',
            dateObj: sorted.length > 0 ? new Date(sorted[0].date) : new Date(),
            name: 'START',
            fullDate: 'Saldo Awal',
            pnl: parseFloat(cumulative.toFixed(2)),
            tradePnl: 0,
            drawdown: 0
        }];

        // Adjust start date to be slightly before first trade
        if (fullData[0].id === 'start' && sorted.length > 0) {
            const d = new Date(sorted[0].date);
            d.setMinutes(d.getMinutes() - 1);
            fullData[0].dateObj = d;
        }

        sorted.forEach((trade, idx) => {
            cumulative += parseFloat(trade.pnlCent || 0);

            // Update high water mark
            if (cumulative > highWaterMark) {
                highWaterMark = cumulative;
            }

            // Calculate drawdown from high water mark
            const drawdown = Math.max(0, highWaterMark - cumulative);

            const outputDate = new Date(trade.date || Date.now());
            const dateStr = outputDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

            fullData.push({
                id: trade.id || `trade-${idx}`,
                dateObj: outputDate,
                name: dateStr === lastDate ? '' : dateStr,
                fullDate: outputDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }) + ` (#${idx + 1})`,
                pnl: parseFloat(cumulative.toFixed(2)),
                tradePnl: parseFloat(parseFloat(trade.pnlCent || 0).toFixed(2)),
                drawdown: parseFloat(drawdown.toFixed(2))
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
        const firstTradeIndex = fullData.findIndex(d => d.id !== 'start' && d.id !== 'view_start' && d.dateObj >= filterDate);

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
        <div className="relative group" ref={chartRef}>
            {/* Header Controls */}
            <div className="absolute top-0 right-0 z-10 flex gap-2 p-4">
                <button
                    onClick={exportChart}
                    className="text-[9px] font-black px-4 py-2 rounded-xl transition-all border bg-white/5 text-slate-400 border-white/10 hover:text-slate-800 hover:bg-white/10 uppercase tracking-[0.2em] flex items-center gap-2"
                    title="Export Chart"
                >
                    <Download size={12} />
                    Export
                </button>
                {['1W', '1M', 'ALL'].map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`text-[9px] font-black px-4 py-2 rounded-xl transition-all border ${timeframe === tf
                            ? 'bg-blue-500 text-white border-blue-500 shadow-xl shadow-blue-500/10'
                            : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-800 hover:bg-white/10'
                            } uppercase tracking-[0.2em]`}
                    >
                        {tf}
                    </button>
                ))}
            </div>

            {/* Background Glow */}
            <div className={`absolute inset-0 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-1000 -z-10 ${chartData[chartData.length - 1]?.pnl >= initialBalance ? 'bg-emerald-500/5' : 'bg-rose-500/5'
                }`}></div>

            <div className="h-[350px] md:h-[400px] w-full mt-12 md:mt-8 -ml-2 md:-ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 20, right: 0, left: -5, bottom: 0 }}>
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

                        <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} opacity={0.3} />

                        <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                            fontSize={8}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            fontFamily="monospace"
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            stroke="#94a3b8"
                            fontSize={8}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value.toLocaleString('id-ID')}
                            fontFamily="monospace"
                            domain={[minPnl - buffer, maxPnl + buffer]}
                            width={35}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />

                        {/* Break Even Line */}
                        <ReferenceLine
                            y={initialBalance}
                            stroke="#94a3b8"
                            strokeDasharray="3 3"
                            opacity={0.5}
                            label={{ position: 'insideTopRight', value: 'BEP', fill: '#94a3b8', fontSize: 9, fontWeight: 'bold' }}
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
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EquityChart;
