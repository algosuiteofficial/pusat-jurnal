import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

const Dashboard = ({ totals }) => {
    const isProfit = totals.cent >= 0;

    return (
        <div className="flex flex-col gap-4">
            {/* Cent Card */}
            <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl transition-all hover:bg-slate-900/60 group">
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                <div className="relative flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total PnL (Cent)</p>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-3xl font-black font-mono tracking-tighter ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isProfit ? '+' : ''}{totals.cent.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-xl ${isProfit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isProfit ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                    </div>
                </div>
            </div>

            {/* IDR Card */}
            <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-5 rounded-2xl transition-all hover:bg-slate-900/60 group">
                <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20 bg-blue-500"></div>
                <div className="relative flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total PnL (IDR)</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-blue-500 text-sm font-bold">Rp</span>
                            <span className={`text-3xl font-black font-mono tracking-tighter ${isProfit ? 'text-slate-100' : 'text-slate-400'}`}>
                                {Math.abs(Math.round(totals.idr)).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                        <Wallet size={24} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
