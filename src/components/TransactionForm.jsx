import React, { useState } from 'react';
import { PlusCircle, Send } from 'lucide-react';

const TransactionForm = ({ onAddTrade }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        pair: 'XAUUSD',
        type: 'BUY',
        lots: '',
        pnlCent: '',
        notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.lots || !formData.pnlCent) return;

        onAddTrade(formData);
        setFormData({
            ...formData,
            lots: '',
            pnlCent: '',
            notes: ''
        });
    };

    const inputStyle = "w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-800 text-sm font-medium";
    const labelStyle = "block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1";

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
            <div className="lg:col-span-1">
                <label className={labelStyle}>Tanggal</label>
                <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={inputStyle}
                />
            </div>

            <div className="lg:col-span-1">
                <label className={labelStyle}>Pair</label>
                <input
                    type="text"
                    placeholder="XAUUSD"
                    required
                    value={formData.pair}
                    onChange={(e) => setFormData({ ...formData, pair: e.target.value.toUpperCase() })}
                    className={inputStyle}
                />
            </div>

            <div className="lg:col-span-1">
                <label className={labelStyle}>Jenis</label>
                <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`${inputStyle} appearance-none cursor-pointer`}
                >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                </select>
            </div>

            <div className="lg:col-span-1">
                <label className={labelStyle}>Banyak (Lot)</label>
                <input
                    type="number"
                    step="0.01"
                    placeholder="0.01"
                    required
                    value={formData.lots}
                    onChange={(e) => setFormData({ ...formData, lots: e.target.value })}
                    className={inputStyle}
                />
            </div>

            <div className="lg:col-span-1">
                <label className={labelStyle}>Laba (Cent)</label>
                <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                    value={formData.pnlCent}
                    onChange={(e) => setFormData({ ...formData, pnlCent: e.target.value })}
                    className={inputStyle}
                />
            </div>

            <div className="lg:col-span-1">
                <label className={labelStyle}>Catatan</label>
                <input
                    type="text"
                    placeholder="..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className={inputStyle}
                />
            </div>

            <div className="lg:col-span-1">
                <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/20 uppercase text-xs tracking-widest"
                >
                    <Send size={16} />
                    Simpan
                </button>
            </div>
        </form>
    );
};

export default TransactionForm;
