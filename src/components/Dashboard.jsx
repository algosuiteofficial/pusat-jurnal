import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Layout } from 'lucide-react';

const Dashboard = ({ totals }) => {
    const isProfit = totals.pnlCent >= 0;

    return (
        <div className="flex flex-col gap-4">
            {/* Balance Card */}
            <div className="relative overflow-hidden bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl transition-all shadow-xl">
                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 bg-blue-500"></div>
                <div className="relative flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Saldo Sekarang (Cent)</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black font-mono tracking-tighter text-white">
                                {totals.balanceCent.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        </div>
                        <p className="text-blue-500/80 text-[10px] font-bold font-mono">
                            ≈ Rp {Math.abs(Math.round(totals.balanceIdr)).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                        <Layout size={24} />
                    </div>
                </div>
            </div>

            {/* PnL Card */}
            <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl transition-all hover:bg-slate-900/60 group">
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <div className="relative flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Laba/Rugi</p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black font-mono tracking-tighter ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isProfit ? '+' : ''}{totals.pnlCent.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <p className={`text-[10px] font-bold font-mono ${isProfit ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                            Rp {Math.abs(Math.round(totals.pnlIdr)).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className={`p-3 rounded-xl ${isProfit ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20'}`}>
                        {isProfit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
