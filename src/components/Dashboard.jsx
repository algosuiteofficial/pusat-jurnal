import React from 'react';
import { TrendingUp, TrendingDown, Layout, Target, Activity, Wallet } from 'lucide-react';

const StatCard = ({ label, value, subValue, icon: Icon, colorClass, gradientClass, glowClass }) => (
    <div className={`glass-card p-5 md:p-6 rounded-3xl group hover:scale-[1.02] transition-all duration-300 relative overflow-hidden ${gradientClass}`}>
        {/* Background Glow Effect */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowClass} blur-3xl -z-10`}></div>

        {/* Shimmer Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_ease-in-out]"></div>
        </div>

        <div className="flex flex-col justify-between h-full relative z-10">
            <div className="flex items-start justify-between mb-4">
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.25em] opacity-70">{label}</p>

                {/* Enhanced Icon with Circle Background */}
                <div className={`p-2.5 rounded-xl ${colorClass.replace('text-', 'bg-')}/10 border border-${colorClass.split('-')[1]}-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon className={`w-4 h-4 ${colorClass}`} strokeWidth={2} />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-black font-mono tracking-tighter text-slate-800 group-hover:text-slate-900 transition-colors">
                        {value || '0'}
                    </span>
                </div>
                {subValue && (
                    <p className="text-slate-500 text-[11px] font-bold font-mono tracking-wide truncate">
                        {subValue}
                    </p>
                )}
            </div>
        </div>

        {/* Bottom Border Accent */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 ${colorClass.replace('text-', 'bg-')} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
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
                colorClass="text-blue-500"
                gradientClass="bg-gradient-to-br from-blue-50/50 to-transparent"
                glowClass="bg-blue-500/20"
            />

            <div className="grid grid-cols-1 gap-4">
                {/* PnL Card */}
                <StatCard
                    label="Total Laba/Rugi"
                    value={`${isProfit ? '+' : ''}${(totals?.pnlCent || 0).toLocaleString('id-ID')}`}
                    subValue={`Rp ${Math.abs(Math.round(totals?.pnlIdr || 0)).toLocaleString('id-ID')}`}
                    icon={isProfit ? TrendingUp : TrendingDown}
                    colorClass={isProfit ? 'text-emerald-500' : 'text-rose-500'}
                    gradientClass={isProfit ? 'bg-gradient-to-br from-emerald-50/50 to-transparent' : 'bg-gradient-to-br from-rose-50/50 to-transparent'}
                    glowClass={isProfit ? 'bg-emerald-500/20' : 'bg-rose-500/20'}
                />

                {/* Win Rate Card */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        label="Win Rate"
                        value={`${stats.winRate}%`}
                        subValue={`${stats.totalTrades} Trade`}
                        icon={Target}
                        colorClass="text-amber-500"
                        gradientClass="bg-gradient-to-br from-amber-50/50 to-transparent"
                        glowClass="bg-amber-500/20"
                    />
                    <StatCard
                        label="Avg Profit"
                        value={stats.avgProfit}
                        subValue="per trade"
                        icon={Activity}
                        colorClass="text-purple-500"
                        gradientClass="bg-gradient-to-br from-purple-50/50 to-transparent"
                        glowClass="bg-purple-500/20"
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
