import React, { useState } from 'react';
import { Repeat, Settings, RotateCcw } from 'lucide-react';

const CONVERSION_RATE = 595;
const IDR_EQUIVALENT = 100000;

const Calculator = ({ initialBalance, setInitialBalance, onReset }) => {
    const [cent, setCent] = useState('');
    const [idr, setIdr] = useState('');

    const handleCentChange = (e) => {
        const value = e.target.value;
        setCent(value);
        if (value === '') {
            setIdr('');
        } else {
            const calculatedIdr = (parseFloat(value) / CONVERSION_RATE) * IDR_EQUIVALENT;
            setIdr(Math.round(calculatedIdr).toLocaleString('id-ID'));
        }
    };

    const handleIdrChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (value === '') {
            setIdr('');
            setCent('');
        } else {
            setIdr(parseFloat(value).toLocaleString('id-ID'));
            const calculatedCent = (parseFloat(value) / IDR_EQUIVALENT) * CONVERSION_RATE;
            setCent(calculatedCent.toFixed(2));
        }
    };

    return (
        <div className="flex flex-wrap items-center glass-card rounded-2xl group border-none shadow-none">
            {/* Dynamic Initial Balance Field */}
            <div className="px-6 py-3 flex flex-col items-start border-r border-white/10 bg-blue-500/5">
                <label className="text-[9px] font-black text-blue-500 tracking-widest mb-1 uppercase">
                    Modal Awal (Cent)
                </label>
                <input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                    className="bg-transparent text-slate-800 font-mono text-lg focus:outline-none w-24 md:w-32 font-black"
                />
            </div>

            <div className="px-6 py-3 flex flex-col items-start border-r border-white/10">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Konversi</label>
                <input
                    type="number"
                    value={cent}
                    onChange={handleCentChange}
                    placeholder="0.00"
                    className="bg-transparent text-slate-800 font-mono text-lg focus:outline-none w-24 md:w-28 placeholder:text-slate-300 font-black"
                />
            </div>

            <div className="px-6 py-3 flex flex-col items-start">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimasi IDR</label>
                <div className="flex items-center">
                    <span className="text-slate-300 text-xs font-bold mr-1">Rp</span>
                    <input
                        type="text"
                        value={idr}
                        onChange={handleIdrChange}
                        placeholder="0"
                        className="bg-transparent text-slate-800 font-mono text-lg focus:outline-none w-28 md:w-36 placeholder:text-slate-300 font-black"
                    />
                </div>
            </div>

            {/* Reset Button (Hidden by default, visible on hover/tap) */}
            <button
                onClick={onReset}
                title="Reset Jurnal (Hapus Semua Data)"
                className="absolute right-0 top-0 h-full w-8 bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
            >
                <RotateCcw size={16} />
            </button>
        </div>
    );
};

export default Calculator;
