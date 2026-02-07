import React, { useState, useMemo } from 'react';
import { Target, Edit3, Check, X, TrendingUp, TrendingDown, Calendar as CalendarIcon, Flame } from 'lucide-react';

const MonthlyProgress = ({ currentMonthPnl, target, onUpdateTarget, trades = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTarget, setTempTarget] = useState(target);
    const [showCalendar, setShowCalendar] = useState(false);

    const progress = target > 0 ? Math.min(Math.max((currentMonthPnl / target) * 100, 0), 100) : 0;
    const isTargetReached = target > 0 && currentMonthPnl >= target;

    const handleSave = () => {
        onUpdateTarget(parseFloat(tempTarget) || 0);
        setIsEditing(false);
    };

    // Calculate milestones
    const milestones = [
        { percent: 25, label: '25%', value: target * 0.25 },
        { percent: 50, label: '50%', value: target * 0.50 },
        { percent: 75, label: '75%', value: target * 0.75 },
        { percent: 100, label: '100%', value: target }
    ];

    // Process daily data for calendar
    const dailyData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Get first and last day of current month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);

        // Group trades by date
        const tradesByDate = {};
        trades.forEach(trade => {
            const tradeDate = new Date(trade.date);
            if (tradeDate.getMonth() === currentMonth && tradeDate.getFullYear() === currentYear) {
                const dateKey = tradeDate.toISOString().split('T')[0];
                if (!tradesByDate[dateKey]) {
                    tradesByDate[dateKey] = {
                        pnl: 0,
                        count: 0,
                        trades: []
                    };
                }
                tradesByDate[dateKey].pnl += parseFloat(trade.pnlCent || 0);
                tradesByDate[dateKey].count += 1;
                tradesByDate[dateKey].trades.push(trade);
            }
        });

        // Create calendar grid
        const days = [];
        const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

        // Add empty cells for days before month starts
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateKey = date.toISOString().split('T')[0];
            const dayData = tradesByDate[dateKey];

            days.push({
                day,
                date: dateKey,
                pnl: dayData ? dayData.pnl : 0,
                count: dayData ? dayData.count : 0,
                trades: dayData ? dayData.trades : [],
                isToday: day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()
            });
        }

        return days;
    }, [trades]);

    // Calculate streak
    const streakData = useMemo(() => {
        const sortedTrades = [...trades]
            .filter(t => {
                const tradeDate = new Date(t.date);
                const now = new Date();
                return tradeDate.getMonth() === now.getMonth() && tradeDate.getFullYear() === now.getFullYear();
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedTrades.length === 0) return { type: 'none', count: 0 };

        let currentStreak = 0;
        let streakType = null;

        // Group by day and calculate daily P&L
        const dailyPnL = {};
        sortedTrades.forEach(trade => {
            const dateKey = new Date(trade.date).toISOString().split('T')[0];
            if (!dailyPnL[dateKey]) dailyPnL[dateKey] = 0;
            dailyPnL[dateKey] += parseFloat(trade.pnlCent || 0);
        });

        const sortedDays = Object.entries(dailyPnL).sort((a, b) => new Date(b[0]) - new Date(a[0]));

        for (const [date, pnl] of sortedDays) {
            const isProfit = pnl > 0;

            if (streakType === null) {
                streakType = isProfit ? 'win' : 'loss';
                currentStreak = 1;
            } else if ((streakType === 'win' && isProfit) || (streakType === 'loss' && !isProfit)) {
                currentStreak++;
            } else {
                break;
            }
        }

        return { type: streakType || 'none', count: currentStreak };
    }, [trades]);

    // Get intensity class for heatmap
    const getIntensityClass = (pnl) => {
        if (pnl === 0) return 'bg-slate-100 border-slate-200';
        if (pnl > 0) {
            if (pnl >= 500) return 'bg-emerald-600 border-emerald-700 shadow-sm shadow-emerald-500/20';
            if (pnl >= 200) return 'bg-emerald-500 border-emerald-600';
            if (pnl >= 50) return 'bg-emerald-400 border-emerald-500';
            return 'bg-emerald-300 border-emerald-400';
        } else {
            if (pnl <= -500) return 'bg-rose-600 border-rose-700 shadow-sm shadow-rose-500/20';
            if (pnl <= -200) return 'bg-rose-500 border-rose-600';
            if (pnl <= -50) return 'bg-rose-400 border-rose-500';
            return 'bg-rose-300 border-rose-400';
        }
    };

    return (
        <div className="glass-card p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Target className="text-blue-500" size={24} strokeWidth={1.5} />
                    <div>
                        <h3 className="text-base font-black text-slate-800 uppercase tracking-tighter">Target Bulanan</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-60">Revenue Performance Tracking</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={`p-2 rounded-xl transition-all border ${showCalendar
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-800 hover:bg-white/10'
                            }`}
                        title="Toggle Calendar View"
                    >
                        <CalendarIcon size={14} />
                    </button>
                    {isEditing ? (
                        <div className="flex items-center gap-1 bg-white/50 rounded-lg p-1 border border-slate-200/50">
                            <input
                                type="number"
                                value={tempTarget}
                                onChange={(e) => setTempTarget(e.target.value)}
                                className="w-20 bg-transparent text-xs font-mono text-blue-600 focus:outline-none px-2"
                                autoFocus
                            />
                            <button onClick={handleSave} className="p-1 text-emerald-600 hover:text-emerald-500 transition-colors">
                                <Check size={14} />
                            </button>
                            <button onClick={() => setIsEditing(false)} className="p-1 text-rose-600 hover:text-rose-500 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => { setTempTarget(target); setIsEditing(true); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-slate-800 transition-all text-[9px] font-black uppercase tracking-[0.2em] border border-white/10"
                        >
                            <Edit3 size={12} strokeWidth={2} />
                            Adjust
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profit Saat Ini</span>
                        <p className={`text-2xl font-black font-mono tracking-tighter ${(currentMonthPnl || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {(currentMonthPnl || 0).toLocaleString('id-ID')} <span className="text-[9px] opacity-60">CENT</span>
                        </p>
                    </div>
                    <div className="text-right space-y-0.5">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</span>
                        <p className="text-xl font-black font-mono tracking-tighter text-blue-600">
                            {(target || 0).toLocaleString('id-ID')} <span className="text-[10px]">CENT</span>
                        </p>
                    </div>
                </div>

                {/* Enhanced Progress Bar with Milestones */}
                <div className="relative">
                    <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${isTargetReached
                                    ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                    : 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600'
                                }`}
                            style={{ width: `${progress}%` }}
                        >
                            {progress > 10 && (
                                <div className="absolute top-0 right-0 bottom-0 w-12 bg-white/30 skew-x-12 -translate-x-full animate-[shimmer_2.5s_infinite]"></div>
                            )}
                        </div>
                    </div>

                    {/* Milestone Markers */}
                    <div className="absolute -top-1 left-0 w-full h-6 pointer-events-none">
                        {milestones.map((milestone) => (
                            <div
                                key={milestone.percent}
                                className="absolute top-0 transform -translate-x-1/2"
                                style={{ left: `${milestone.percent}%` }}
                            >
                                <div className={`w-0.5 h-6 ${progress >= milestone.percent
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-300'
                                    }`}></div>
                                <span className={`absolute top-7 left-1/2 transform -translate-x-1/2 text-[8px] font-black uppercase tracking-wider ${progress >= milestone.percent
                                        ? 'text-emerald-600'
                                        : 'text-slate-400'
                                    }`}>
                                    {milestone.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] mt-8">
                    <span className={isTargetReached ? 'text-emerald-600' : 'text-slate-400'}>
                        {isTargetReached ? '🎯 Target Tercapai!' : `${(progress || 0).toFixed(1)}% Terlampaui`}
                    </span>
                    <span className="text-slate-400">
                        {Math.max(0, (target || 0) - (currentMonthPnl || 0)).toLocaleString('id-ID')} CENT Lagi
                    </span>
                </div>

                {/* Calendar View (Collapsible) */}
                {showCalendar && (
                    <div className="mt-6 pt-6 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Daily Breakdown</h4>

                            {/* Streak Counter */}
                            {streakData.count > 0 && (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${streakData.type === 'win'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : 'bg-rose-50 border-rose-200 text-rose-700'
                                    }`}>
                                    <Flame size={14} className={streakData.type === 'win' ? 'text-emerald-500' : 'text-rose-500'} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">
                                        {streakData.count} Day {streakData.type === 'win' ? 'Win' : 'Loss'} Streak
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Calendar Grid */}
                        <div className="bg-white/30 rounded-2xl p-4 border border-slate-200/50">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 gap-2 mb-3">
                                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                                    <div key={day} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar days */}
                            <div className="grid grid-cols-7 gap-2">
                                {dailyData.map((dayData, idx) => (
                                    <div key={idx} className="relative group">
                                        {dayData ? (
                                            <div
                                                className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all cursor-pointer hover:scale-110 hover:z-10 ${getIntensityClass(dayData.pnl)
                                                    } ${dayData.isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                                                title={`${dayData.day} - ${dayData.count} trades - ${dayData.pnl > 0 ? '+' : ''}${dayData.pnl.toFixed(0)} cent`}
                                            >
                                                <span className={dayData.pnl !== 0 ? 'text-white' : 'text-slate-500'}>
                                                    {dayData.day}
                                                </span>

                                                {/* Tooltip */}
                                                {dayData.count > 0 && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                                        <div className="bg-slate-900 text-white text-[10px] px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
                                                            <div className="font-black">{dayData.day} {new Date().toLocaleDateString('id-ID', { month: 'short' })}</div>
                                                            <div className="text-slate-300">{dayData.count} trade{dayData.count > 1 ? 's' : ''}</div>
                                                            <div className={`font-mono font-bold ${dayData.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                {dayData.pnl >= 0 ? '+' : ''}{dayData.pnl.toFixed(2)} cent
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="aspect-square"></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-between text-[9px]">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider">Intensitas:</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></div>
                                        <div className="w-3 h-3 rounded bg-emerald-300 border border-emerald-400"></div>
                                        <div className="w-3 h-3 rounded bg-emerald-500 border border-emerald-600"></div>
                                        <div className="w-3 h-3 rounded bg-emerald-600 border border-emerald-700"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp size={10} className="text-emerald-500" />
                                        <span className="text-slate-400 font-bold">Profit</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <TrendingDown size={10} className="text-rose-500" />
                                        <span className="text-slate-400 font-bold">Loss</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyProgress;
