import React from 'react';
import { TrendingUp, TrendingDown, Layout, Target, Activity, Wallet } from 'lucide-react';

const StatCard = ({ label, value, subValue, icon: Icon, colorClass, bgColorClass, ringColorClass }) => (
    <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 p-4 md:p-5 rounded-2xl transition-all hover:bg-slate-900/80 group shadow-lg">
        {/* Removed the large blur blob as it was causing visual clutter */}
        <div className="flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-1.5 md:mb-2">
                <p className="text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em]">{label}</p>
                <div className={`p-1.5 md:p-2 rounded-lg ${bgColorClass} ${colorClass} ring-1 ${ringColorClass} bg-opacity-50`}>
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={2.5} />
                </div>
            </div>

            <div className="space-y-0.5">
                <div className="flex items-baseline gap-1">
                    <span className={`text-xl md:text-2xl font-black font-mono tracking-tighter ${colorClass}`}>
                        {value || '0'}
                    </span>
                </div>
                {subValue && (
                    <p className="text-slate-600 text-[8px] md:text-[9px] font-bold font-mono uppercase tracking-widest truncate">
                        {subValue}
                    </p>
                )}
            </div>
        </div>
    </div>
);

const Dashboard = ({ totals, trades = [] }) => {
    const isProfit = totals.pnlCent >= 0;

    // Advanced Stats Calculation
    const stats = React.useMemo(() => {
        if (!trades || trades.length === 0) return { winRate: 0, totalTrades: 0, avgProfit: 0 };

        const wins = trades.filter(t => parseFloat(t.pnlCent || 0) > 0).length;
        const winRate = (wins / trades.length) * 100;
        const totalPnl = totals?.pnlCent || 0;

        return {
            winRate: winRate.toFixed(1),
            totalTrades: trades.length,
            avgProfit: (totalPnl / trades.length).toFixed(2)
        };
    }, [trades, totals?.pnlCent]);

    return (
        <div className="space-y-4">
            {/* Primary Balance */}
            <StatCard
                label="Saldo Akun"
                value={(totals?.balanceCent || 0).toLocaleString('id-ID')}
                subValue={`≈ Rp ${Math.abs(Math.round(totals?.balanceIdr || 0)).toLocaleString('id-ID')}`}
                icon={Wallet}
                colorClass="text-blue-400"
                bgColorClass="bg-blue-500/10"
                ringColorClass="ring-blue-500/20"
            />

            <div className="grid grid-cols-1 gap-4">
                {/* PnL Card */}
                <StatCard
                    label="Total Laba/Rugi"
                    value={`${isProfit ? '+' : ''}${(totals?.pnlCent || 0).toLocaleString('id-ID')}`}
                    subValue={`Rp ${Math.abs(Math.round(totals?.pnlIdr || 0)).toLocaleString('id-ID')}`}
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
                        subValue={`${stats.totalTrades} Trade`}
                        icon={Target}
                        colorClass="text-amber-400"
                        bgColorClass="bg-amber-500/10"
                        ringColorClass="ring-amber-500/20"
                    />
                    <StatCard
                        label="Rata-rata Profit"
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
