import React from 'react';
import { Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JournalTable = ({ trades, onDeleteTrade, calculateIDR }) => {
    if (trades.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-slate-600"
            >
                <p className="text-lg">No trades recorded for this period.</p>
                <p className="text-sm">Change filters or add your first trade above.</p>
            </motion.div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-800">
                        <th className="pb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="pb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Pair</th>
                        <th className="pb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="pb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lots</th>
                        <th className="pb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">PnL (Cent)</th>
                        <th className="pb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">PnL (IDR)</th>
                        <th className="pb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</th>
                        <th className="pb-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
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
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group"
                                >
                                    <td className="py-4 px-4 text-sm text-slate-400 font-mono">
                                        {new Date(trade.date).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="py-4 px-4 font-bold text-slate-200">
                                        {trade.pair}
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${trade.type === 'BUY'
                                                ? 'bg-emerald-500/10 text-emerald-500'
                                                : 'bg-rose-500/10 text-rose-500'
                                            }`}>
                                            {trade.type}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-slate-300 font-mono text-sm">
                                        {trade.lots}
                                    </td>
                                    <td className={`py-4 px-4 text-right font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                        {isProfit ? '+' : ''}{trade.pnlCent}
                                    </td>
                                    <td className={`py-4 px-4 text-right font-mono font-bold ${isProfit ? 'text-blue-400' : 'text-slate-300'
                                        }`}>
                                        {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            maximumFractionDigits: 0
                                        }).format(idrValue)}
                                    </td>
                                    <td className="py-4 px-4 text-slate-500 text-xs max-w-[200px] truncate italic" title={trade.notes}>
                                        {trade.notes || '-'}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={() => onDeleteTrade(trade.id)}
                                            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all active:scale-95 opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
};

export default JournalTable;
