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

    const inputStyle = "glass-input text-slate-800 text-sm font-black w-full";
    const labelStyle = "block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1 opacity-70";

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 md:gap-4 items-end">
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
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-4 px-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-blue-500/10 uppercase text-xs tracking-[0.2em]"
                >
                    <PlusCircle size={16} />
                    Submit Trade
                </button>
            </div>
        </form>
    );
};

export default TransactionForm;
