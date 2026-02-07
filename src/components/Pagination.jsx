import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                Halaman {currentPage} dari {totalPages}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-200 bg-white/60 text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1 mx-2">
                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-200 bg-white/60 text-slate-400 hover:text-slate-800 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
