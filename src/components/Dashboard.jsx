import React from 'react';
import { TrendingUp, TrendingDown, Layout, Target, Activity } from 'lucide-react';

const StatCard = ({ label, value, subValue, icon: Icon, colorClass, bgColorClass, ringColorClass }) => (
    <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl transition-all hover:bg-slate-900/60 group">
        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 ${bgColorClass}`}></div>
        <div className="relative flex items-center justify-between">
            <div className="space-y-1">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black font-mono tracking-tighter ${colorClass}`}>
                        {value}
                    </span>
                </div>
                {subValue && (
                    <p className="text-slate-600 text-[10px] font-bold font-mono uppercase tracking-tighter">
                        {subValue}
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${bgColorClass} ${colorClass} ring-1 ${ringColorClass}`}>
                <Icon size={20} />
            </div>
        </div>
    </div>
);

const Dashboard = ({ totals, trades = [] }) => {
    const isProfit = totals.pnlCent >= 0;

    // Advanced Stats Calculation
    const stats = React.useMemo(() => {
        if (!trades.length) return { winRate: 0, totalTrades: 0, avgProfit: 0 };

        const wins = trades.filter(t => parseFloat(t.pnlCent) > 0).length;
        const winRate = (wins / trades.length) * 100;

        return {
            winRate: winRate.toFixed(1),
            totalTrades: trades.length,
            avgProfit: (totals.pnlCent / trades.length).toFixed(2)
        };
    }, [trades, totals.pnlCent]);

    return (
        <div className="space-y-4">
            {/* Primary Balance */}
            <StatCard
                label="Saldo Sekarang"
                value={totals.balanceCent.toLocaleString('id-ID')}
                subValue={`≈ Rp ${Math.abs(Math.round(totals.balanceIdr)).toLocaleString('id-ID')}`}
                icon={Layout}
                colorClass="text-white"
                bgColorClass="bg-blue-500/10"
                ringColorClass="ring-blue-500/20"
            />

            <div className="grid grid-cols-1 gap-4">
                {/* PnL Card */}
                <StatCard
                    label="Total Laba/Rugi"
                    value={`${isProfit ? '+' : ''}${totals.pnlCent.toLocaleString('id-ID')}`}
                    subValue={`Rp ${Math.abs(Math.round(totals.pnlIdr)).toLocaleString('id-ID')}`}
                    icon={isProfit ? TrendingUp : TrendingDown}
                    colorClass={isProfit ? 'text-emerald-400' : 'text-rose-400'}
                    bgColorClass={isProfit ? 'bg-emerald-500/10' : 'bg-rose-500/10'}
                    ringColorClass={isProfit ? 'ring-emerald-500/20' : 'ring-rose-500/20'}
                />

                {/* Win Rate Card */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        label="Win Rate"
                        value={`${stats.winRate}%`}
                        subValue={`${stats.totalTrades} Total Trades`}
                        icon={Target}
                        colorClass="text-amber-400"
                        bgColorClass="bg-amber-500/10"
                        ringColorClass="ring-amber-500/20"
                    />
                    <StatCard
                        label="Avg. Profit"
                        value={stats.avgProfit}
                        icon={Activity}
                        colorClass="text-purple-400"
                        bgColorClass="bg-purple-500/10"
                        ringColorClass="ring-purple-500/20"
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
