import React from 'react';
import { Calendar, ArrowUpDown, Filter } from 'lucide-react';

const Filters = ({ filterRange, setFilterRange, sortBy, setSortBy }) => {
    return (
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 md:gap-3 max-w-full overflow-hidden">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Jangkauan:</span>
                <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/50 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: 'Semua' },
                        { id: 'week', label: 'Pekan' },
                        { id: 'month', label: 'Bulan' }
                    ].map((range) => (
                        <button
                            key={range.id}
                            onClick={() => setFilterRange(range.id)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterRange === range.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urutan:</span>
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    >
                        <option value="date-desc">Tanggal Terbaru</option>
                        <option value="date-asc">Tanggal Terlama</option>
                        <option value="pnl-desc">PnL Tertinggi</option>
                        <option value="pnl-asc">PnL Terendah</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                        <ArrowUpDown size={14} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Filters;
