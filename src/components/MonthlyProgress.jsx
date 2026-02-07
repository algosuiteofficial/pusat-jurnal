import React, { useState } from 'react';
import { Target, Edit3, Check, X } from 'lucide-react';

const MonthlyProgress = ({ currentMonthPnl, target, onUpdateTarget }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTarget, setTempTarget] = useState(target);

    const progress = target > 0 ? Math.min(Math.max((currentMonthPnl / target) * 100, 0), 100) : 0;
    const isTargetReached = target > 0 && currentMonthPnl >= target;

    const handleSave = () => {
        onUpdateTarget(parseFloat(tempTarget) || 0);
        setIsEditing(false);
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Target size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Proses Target Bulanan</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Target Profit Bulan Ini</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <div className="flex items-center gap-1 bg-slate-950/50 rounded-lg p-1 border border-slate-800">
                            <input
                                type="number"
                                value={tempTarget}
                                onChange={(e) => setTempTarget(e.target.value)}
                                className="w-20 bg-transparent text-xs font-mono text-blue-400 focus:outline-none px-2"
                                autoFocus
                            />
                            <button onClick={handleSave} className="p-1 hover:text-emerald-500 transition-colors">
                                <Check size={14} />
                            </button>
                            <button onClick={() => setIsEditing(false)} className="p-1 hover:text-rose-500 transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => { setTempTarget(target); setIsEditing(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-slate-700/50"
                        >
                            <Edit3 size={12} />
                            Set Target
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profit Saat Ini</span>
                        <p className={`text-xl font-black font-mono tracking-tighter ${(currentMonthPnl || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {(currentMonthPnl || 0).toLocaleString('id-ID')} <span className="text-[10px]">CENT</span>
                        </p>
                    </div>
                    <div className="text-right space-y-0.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target</span>
                        <p className="text-xl font-black font-mono tracking-tighter text-blue-400">
                            {(target || 0).toLocaleString('id-ID')} <span className="text-[10px]">CENT</span>
                        </p>
                    </div>
                </div>

                <div className="relative h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${isTargetReached ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gradient-to-r from-blue-600 to-blue-400'
                            }`}
                        style={{ width: `${progress}%` }}
                    >
                        {progress > 10 && (
                            <div className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em]">
                    <span className={isTargetReached ? 'text-emerald-500' : 'text-slate-600'}>
                        {isTargetReached ? '🎯 Target Tercapai!' : `${(progress || 0).toFixed(1)}% Terlampaui`}
                    </span>
                    <span className="text-slate-600">
                        {Math.max(0, (target || 0) - (currentMonthPnl || 0)).toLocaleString('id-ID')} CENT Lagi
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MonthlyProgress;
