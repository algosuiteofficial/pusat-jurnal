import React from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    handleReset = () => {
        if (window.confirm("Ini akan menghapus semua data lokal dan me-refresh aplikasi. Lanjutkan?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 text-slate-300 font-sans">
                    <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl border border-rose-500/20 p-8 rounded-[2rem] shadow-2xl text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 rounded-full bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20 animate-pulse">
                                <AlertCircle size={48} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Opps! Terjadi Kesalahan</h1>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                Aplikasi mengalami masalah saat memuat data atau merender komponen.
                            </p>
                        </div>

                        <div className="p-4 bg-black/40 rounded-xl border border-slate-800 text-left">
                            <p className="text-[10px] font-mono text-rose-400 break-words">
                                {this.state.error?.toString() || "Unknown Error"}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                            >
                                <RefreshCw size={18} />
                                Coba Muat Ulang
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all active:scale-95"
                            >
                                <Trash2 size={18} />
                                Hapus Cache & Reset
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
