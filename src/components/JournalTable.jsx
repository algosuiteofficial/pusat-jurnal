import React from 'react';
import { Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JournalTable = ({ trades, onDeleteTrade, calculateIDR }) => {
    if (trades.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-slate-600"
            >
                <p className="text-lg">Belum ada riwayat transaksi.</p>
                <p className="text-sm">Silakan tambah trade baru melalui formulir di atas.</p>
            </motion.div>
        );
    }

    return (
        <div className="w-full">
            {/* --- Desktop View: Table (Hidden on Mobile) --- */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800">
                            <th className="pb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tanggal</th>
                            <th className="pb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Pair</th>
                            <th className="pb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tipe</th>
                            <th className="pb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Lot</th>
                            <th className="pb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">PnL (Cent)</th>
                            <th className="pb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">PnL (IDR)</th>
                            <th className="pb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Catatan</th>
                            <th className="pb-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {trades.map((trade) => {
                                const isProfit = parseFloat(trade.pnlCent) >= 0;
                                const idrValue = calculateIDR(parseFloat(trade.pnlCent));

                                return (
                                    <motion.tr
                                        layout
                                        key={trade.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors group"
                                    >
                                        <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                                            {new Date(trade.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="py-4 px-4 font-black text-slate-100 uppercase tracking-tighter">
                                            {trade.pair}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20' : 'bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20'
                                                }`}>
                                                {trade.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-400 font-mono text-xs">
                                            {trade.lots}
                                        </td>
                                        <td className={`py-4 px-4 text-right font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {isProfit ? '+' : ''}{trade.pnlCent.toLocaleString('id-ID')}
                                        </td>
                                        <td className={`py-4 px-4 text-right font-mono font-bold ${isProfit ? 'text-blue-400' : 'text-slate-400'}`}>
                                            Rp {Math.abs(Math.round(idrValue)).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-4 px-4 text-slate-500 text-[10px] max-w-[150px] truncate italic" title={trade.notes}>
                                            {trade.notes || '-'}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <button
                                                onClick={() => onDeleteTrade(trade.id)}
                                                className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all active:scale-90 lg:opacity-0 lg:group-hover:opacity-100"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* --- Mobile View: Super Compact List (Visible on Mobile) --- */}
            <div className="lg:hidden space-y-1">
                <AnimatePresence mode="popLayout">
                    {trades.map((trade, index) => {
                        const isProfit = parseFloat(trade.pnlCent) >= 0;
                        const idrValue = calculateIDR(parseFloat(trade.pnlCent));

                        return (
                            <motion.div
                                layout
                                key={trade.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-3 border-b border-slate-800/50 hover:bg-slate-800/10 active:bg-slate-800/20 transition-colors"
                            >
                                {/* Left: Date & Pair Info */}
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-md ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        {trade.type === 'BUY' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-black text-slate-200 uppercase tracking-tight">{trade.pair}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{trade.type}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-600 font-mono">
                                            {new Date(trade.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • Lot {trade.lots}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: PnL & Action */}
                                <div className="flex items-center gap-3 text-right">
                                    <div>
                                        <p className={`text-sm font-black font-mono tracking-tight ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {isProfit ? '+' : ''}{trade.pnlCent.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-600 font-mono">
                                            Rp {Math.abs(Math.round(idrValue)).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onDeleteTrade(trade.id)}
                                        className="p-2 text-slate-700 hover:text-rose-500 active:scale-95 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default JournalTable;
