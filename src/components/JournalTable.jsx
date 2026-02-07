import React, { useState } from 'react';
import { Trash2, ArrowUpRight, ArrowDownLeft, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JournalTable = ({ trades, onDeleteTrade, calculateIDR }) => {
    const [expandedNotes, setExpandedNotes] = useState(new Set());

    const toggleNote = (tradeId) => {
        const newExpanded = new Set(expandedNotes);
        if (newExpanded.has(tradeId)) {
            newExpanded.delete(tradeId);
        } else {
            newExpanded.add(tradeId);
        }
        setExpandedNotes(newExpanded);
    };

    if (trades.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-slate-400"
            >
                <p className="text-lg font-bold">Belum ada riwayat transaksi.</p>
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
                        <tr className="border-b border-white/10">
                            <th className="pb-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">Tanggal</th>
                            <th className="pb-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">Pair</th>
                            <th className="pb-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">Tipe</th>
                            <th className="pb-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">Lot</th>
                            <th className="pb-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-right opacity-60">PnL (Cent)</th>
                            <th className="pb-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-right opacity-60">PnL (IDR)</th>
                            <th className="pb-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">Catatan</th>
                            <th className="pb-6 px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-center opacity-60">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {trades.map((trade) => {
                                const isProfit = parseFloat(trade.pnlCent) >= 0;
                                const idrValue = calculateIDR(parseFloat(trade.pnlCent));
                                const hasNotes = trade.notes && trade.notes.trim().length > 0;
                                const isExpanded = expandedNotes.has(trade.id);
                                const shouldTruncate = hasNotes && trade.notes.length > 50;

                                return (
                                    <motion.tr
                                        layout
                                        key={trade.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`border-b border-black/5 transition-all group ${isProfit
                                                ? 'hover:bg-emerald-50/30 bg-emerald-50/10'
                                                : 'hover:bg-rose-50/30 bg-rose-50/10'
                                            }`}
                                    >
                                        <td className="py-5 px-4 text-xs text-slate-400 font-mono">
                                            {new Date(trade.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td className="py-5 px-4 font-black text-slate-800 uppercase tracking-tighter">
                                            {trade.pair}
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${trade.type === 'BUY'
                                                    ? 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/20'
                                                    : 'text-rose-600 bg-rose-500/10 border border-rose-500/20'
                                                }`}>
                                                {trade.type}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4 text-slate-500 font-mono text-xs font-bold">
                                            {trade.lots}
                                        </td>
                                        <td className={`py-5 px-4 text-right font-mono font-black text-base ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {isProfit ? '+' : ''}{trade.pnlCent.toLocaleString('id-ID')}
                                        </td>
                                        <td className={`py-5 px-4 text-right font-mono font-bold text-sm ${isProfit ? 'text-blue-500' : 'text-slate-400'}`}>
                                            Rp {Math.abs(Math.round(idrValue)).toLocaleString('id-ID')}
                                        </td>
                                        <td className="py-5 px-4 text-slate-600 text-[11px] max-w-[200px]">
                                            {hasNotes ? (
                                                <div className="space-y-1">
                                                    <p className={`${!isExpanded && shouldTruncate ? 'line-clamp-2' : ''} italic leading-relaxed`}>
                                                        {trade.notes}
                                                    </p>
                                                    {shouldTruncate && (
                                                        <button
                                                            onClick={() => toggleNote(trade.id)}
                                                            className="text-blue-500 hover:text-blue-600 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                                        >
                                                            {isExpanded ? (
                                                                <>Sembunyikan <ChevronUp size={10} /></>
                                                            ) : (
                                                                <>Selengkapnya <ChevronDown size={10} /></>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="py-5 px-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => onDeleteTrade(trade.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all active:scale-90 lg:opacity-0 lg:group-hover:opacity-100"
                                                    title="Hapus Trade"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
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
                                className="flex items-center justify-between p-4 border-b border-black/5 hover:bg-white/10 active:bg-white/20 transition-colors first:rounded-t-3xl last:rounded-b-3xl"
                            >
                                {/* Left: Date & Pair Info */}
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-md ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                        {trade.type === 'BUY' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                                    </div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{trade.pair}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{trade.type}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-mono">
                                            {new Date(trade.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • Lot {trade.lots}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: PnL & Action */}
                                <div className="flex items-center gap-3 text-right">
                                    <div>
                                        <p className={`text-sm font-black font-mono tracking-tight ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {isProfit ? '+' : ''}{trade.pnlCent.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 font-mono">
                                            Rp {Math.abs(Math.round(idrValue)).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onDeleteTrade(trade.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 active:scale-95 transition-all"
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
