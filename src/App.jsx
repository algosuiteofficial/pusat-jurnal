import React, { useState, useEffect, useMemo } from 'react';
import Calculator from './components/Calculator';
import TransactionForm from './components/TransactionForm';
import JournalTable from './components/JournalTable';
import Dashboard from './components/Dashboard';
import EquityChart from './components/EquityChart';
import Filters from './components/Filters';
import Pagination from './components/Pagination';
import MonthlyProgress from './components/MonthlyProgress';
import { supabase } from './supabaseClient';
import { RefreshCcw, Cloud, CloudOff, AlertCircle, LucideLayout } from 'lucide-react';


const CONVERSION_RATE = 595;
const IDR_EQUIVALENT = 100000;
function App() {
  const [initialBalance, setInitialBalance] = useState(() => {
    return parseFloat(localStorage.getItem('cent_journal_initial_balance')) || 500000;
  });
  const [trades, setTrades] = useState([]);
  const [filterRange, setFilterRange] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Set to 10 for better visibility, user can change to 20
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('cloud'); // 'cloud' | 'local' | 'error'
  const [monthlyTarget, setMonthlyTarget] = useState(() => {
    return parseFloat(localStorage.getItem('cent_journal_monthly_target')) || 10000;
  });

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRange, sortBy]);


  // Fetch Initial Data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        setSyncStatus('local');
        // Don't throw if not configured, just proceed with local storage
      } else {
        // 1. Fetch Trades
        const tradesRes = await supabase.from('trades').select('*').order('date', { ascending: false });
        if (tradesRes.error) throw tradesRes.error;

        const formattedTrades = (tradesRes.data || []).map(t => ({ ...t, pnlCent: t.pnl_cent || 0 }));
        setTrades(formattedTrades);

        // Update local storage as a fresh backup
        localStorage.setItem('cent_journal_trades', JSON.stringify(formattedTrades));

        // 2. Fetch Initial Balance from settings
        const settingsRes = await supabase.from('settings').select('value').eq('key', 'initial_balance').maybeSingle();
        if (settingsRes.data) {
          const balance = parseFloat(settingsRes.data.value);
          if (!isNaN(balance)) {
            setInitialBalance(balance);
            localStorage.setItem('cent_journal_initial_balance', balance);
          }
        }

        // 3. Fetch Monthly Target
        const targetRes = await supabase.from('settings').select('value').eq('key', 'monthly_target').maybeSingle();
        if (targetRes.data) {
          const target = parseFloat(targetRes.data.value);
          if (!isNaN(target)) {
            setMonthlyTarget(target);
            localStorage.setItem('cent_journal_monthly_target', target);
          }
        }

        setSyncStatus('cloud');
      }
    } catch (error) {
      console.warn('Sync failed, using localStorage:', error.message);
      setSyncStatus('local');
    } finally {
      // Load from LocalStorage if sync failed or not configured
      if (syncStatus === 'local' || !supabase) {
        try {
          const savedTrades = localStorage.getItem('cent_journal_trades');
          if (savedTrades) {
            const parsed = JSON.parse(savedTrades);
            if (Array.isArray(parsed)) setTrades(parsed);
          }

          const savedBalance = localStorage.getItem('cent_journal_initial_balance');
          if (savedBalance) {
            const val = parseFloat(savedBalance);
            if (!isNaN(val)) setInitialBalance(val);
          }

          const savedTarget = localStorage.getItem('cent_journal_monthly_target');
          if (savedTarget) {
            const val = parseFloat(savedTarget);
            if (!isNaN(val)) setMonthlyTarget(val);
          }
        } catch (e) {
          console.error("Local storage corruption:", e);
        }
      }
      setLoading(false);
      setDataLoaded(true); // Signal that we have finished loading (from cloud or local)
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync Settings to DB (Debounced)
  useEffect(() => {
    // CRITICAL: Don't sync until the initial data load is complete.
    // Otherwise, we might overwrite the database with default values (500,000) 
    // before the database has a chance to tell us the actual saved value.
    if (!dataLoaded) return;

    localStorage.setItem('cent_journal_initial_balance', initialBalance);
    localStorage.setItem('cent_journal_monthly_target', monthlyTarget);

    const syncSettings = async () => {
      if (supabase) {
        await supabase.from('settings').upsert([
          { key: 'initial_balance', value: initialBalance.toString() },
          { key: 'monthly_target', value: monthlyTarget.toString() }
        ], { onConflict: 'key' });
      }
    };

    const timeoutId = setTimeout(syncSettings, 1000);
    return () => clearTimeout(timeoutId);
  }, [initialBalance, monthlyTarget, dataLoaded]);



  const addTrade = async (trade) => {
    try {
      if (!supabase) throw new Error('Supabase not configured');

      const dbTrade = {
        date: trade.date,
        pair: trade.pair,
        type: trade.type,
        lots: parseFloat(trade.lots),
        pnl_cent: parseFloat(trade.pnlCent),
        notes: trade.notes
      };

      const { data, error } = await supabase
        .from('trades')
        .insert([dbTrade])
        .select();

      if (error) throw error;

      const newTrade = { ...data[0], pnlCent: data[0].pnl_cent };
      setTrades(prev => {
        const updated = [newTrade, ...prev];
        localStorage.setItem('cent_journal_trades', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.warn('Saving to Local Storage only:', error.message);
      const localTrade = { ...trade, id: Date.now() };
      setTrades(prev => {
        const updated = [localTrade, ...prev];
        localStorage.setItem('cent_journal_trades', JSON.stringify(updated));
        return updated;
      });
    }
  };


  // Security Check
  const verifyPin = () => {
    const enteredPin = prompt('🔒 Masukkan PIN Admin untuk melanjutkan:');
    if (!enteredPin) return false; // User cancelled

    const adminPin = import.meta.env.VITE_ADMIN_PIN || '123456'; // Fallback default
    if (enteredPin === adminPin) return true;

    alert('❌ Akses Ditolak: PIN Salah!');
    return false;
  };

  const deleteTrade = async (id) => {
    if (!verifyPin()) return;

    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

    try {
      if (!supabase) throw new Error('Supabase not configured');

      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrades(prev => {
        const updated = prev.filter(trade => trade.id !== id);
        localStorage.setItem('cent_journal_trades', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.warn('Deleting from Local Storage:', error.message);
      setTrades(prev => {
        const updated = prev.filter(trade => trade.id !== id);
        localStorage.setItem('cent_journal_trades', JSON.stringify(updated));
        return updated;
      });
    }
  };


  const calculateIDR = (cent) => {
    return (cent / CONVERSION_RATE) * IDR_EQUIVALENT;
  };

  const handleResetData = async () => {
    if (!verifyPin()) return;

    if (!window.confirm('PERINGATAN: Apakah Anda yakin ingin MERESET SEMUA data jurnal? Tindakan ini tidak dapat dibatalkan.')) {

      return;
    }

    try {
      setLoading(true);
      // 1. Delete from Supabase
      if (supabase) {
        const { error } = await supabase.from('trades').delete().neq('id', 0); // Delete all rows
        if (error) throw error;
      }

      // 2. Clear Local Storage
      localStorage.removeItem('cent_journal_trades');
      // Optional: Reset Initial Balance too? Let's keep it or ask user. 
      // User said "fitur reset", usually means clear journal. Let's keep balance for convenience or reset it?
      // Let's just clear trades for now as that's the main "journal" data.

      // 3. Update State
      setTrades([]);
      // setInitialBalance(500000); // Uncomment if we want to reset balance too

      alert('Data jurnal berhasil di-reset.');
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Gagal me-reset data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  const processedTrades = useMemo(() => {
    let result = [...trades];
    const now = new Date();

    if (filterRange === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      result = result.filter(t => new Date(t.date) >= startOfWeek);
    } else if (filterRange === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter(t => new Date(t.date) >= startOfMonth);
    }

    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        const dateDiff = new Date(b.date) - new Date(a.date);
        if (dateDiff !== 0) return dateDiff;
        return (b.id || 0) - (a.id || 0); // Fallback to ID desc
      }
      if (sortBy === 'date-asc') {
        const dateDiff = new Date(a.date) - new Date(b.date);
        if (dateDiff !== 0) return dateDiff;
        return (a.id || 0) - (b.id || 0); // Fallback to ID asc
      }
      if (sortBy === 'pnl-desc') return parseFloat(b.pnlCent) - parseFloat(a.pnlCent);
      if (sortBy === 'pnl-asc') return parseFloat(a.pnlCent) - parseFloat(b.pnlCent);
      return 0;
    });


    return result;
  }, [trades, filterRange, sortBy]);

  const paginatedTrades = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedTrades.slice(startIndex, startIndex + itemsPerPage);
  }, [processedTrades, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedTrades.length / itemsPerPage);

  const totals = useMemo(() => {
    const totalCentPnL = processedTrades.reduce((sum, trade) => sum + parseFloat(trade.pnlCent || 0), 0);
    const currentBalance = initialBalance + totalCentPnL;
    return {
      pnlCent: totalCentPnL,
      pnlIdr: calculateIDR(totalCentPnL),
      balanceCent: currentBalance,
      balanceIdr: calculateIDR(currentBalance)
    };
  }, [processedTrades, initialBalance]);

  const currentMonthPnl = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return trades
      .filter(t => new Date(t.date) >= startOfMonth)
      .reduce((sum, trade) => sum + parseFloat(trade.pnlCent || 0), 0);
  }, [trades]);




  const SectionTitle = ({ title, colorClass, subtitle }) => (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <span className={`w-1.5 h-6 rounded-full ${colorClass}`}></span>
        <h2 className="text-xl font-black text-slate-100 uppercase tracking-tighter">{title}</h2>
      </div>
      {subtitle && <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-4.5">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050810] text-slate-300 font-sans selection:bg-blue-500/30 overflow-x-hidden w-full">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-12">
        <header className="relative space-y-8">
          {/* Header Background Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-blue-600/5 blur-[100px] -z-10 rounded-full"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-900/50">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-5xl font-black tracking-[ -0.05em] text-white">
                    JURNAL<span className="text-emerald-500 font-light ml-1">CENT</span>
                  </h1>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-md">
                    {syncStatus === 'cloud' && (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Cloud size={10} /> Cloud Synced
                        </span>
                      </>
                    )}
                    {syncStatus === 'local' && (
                      <>
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                          <CloudOff size={10} /> Local Mode
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] ml-1">Premium Trading Terminal v2.0</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 lg:items-center">
              <Calculator initialBalance={initialBalance} setInitialBalance={setInitialBalance} onReset={handleResetData} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <MonthlyProgress
                currentMonthPnl={currentMonthPnl}
                target={monthlyTarget}
                onUpdateTarget={setMonthlyTarget}
              />
            </div>
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-6 rounded-3xl shadow-xl flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <LucideLayout size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Status Terminal</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Session</p>
                </div>
              </div>
              <div className="mt-2 py-2 px-4 bg-slate-950/50 rounded-xl border border-slate-800 inline-block font-mono text-[10px] text-slate-400">
                REF_ID: {new Date().getTime().toString(36).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 animate-pulse">
            <RefreshCcw size={40} className="animate-spin mb-4 text-blue-500" />
            <p className="text-xs font-bold uppercase tracking-widest">Sinkronisasi Data Supabase...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-6 md:p-8 rounded-[2rem] shadow-2xl">
                <SectionTitle title="Kurva Ekuitas" colorClass="bg-blue-500" subtitle="Pertumbuhan Saldo Real-time" />
                <EquityChart trades={processedTrades} initialBalance={initialBalance} />


              </div>
              <div className="lg:col-span-1 space-y-4">
                <Dashboard totals={totals} trades={processedTrades} />

                <div className="p-5 rounded-2xl border border-slate-800/50 bg-slate-900/20">
                  <p className="text-[10px] leading-relaxed text-slate-600 font-bold uppercase tracking-widest">
                    * Data sinkron dengan cloud database Cloud Supabase dan Vercel.
                  </p>
                </div>
              </div>
            </div>

            <section className="relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-6 md:p-8 rounded-[2rem] shadow-2xl">
              <div className="absolute top-0 right-10 w-40 h-1 bg-gradient-to-l from-emerald-500/50 to-transparent"></div>
              <SectionTitle title="Input Transaksi" colorClass="bg-emerald-500" subtitle="Tambahkan trade baru ke jurnal" />
              <TransactionForm onAddTrade={addTrade} />
            </section>

            <section className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-6 md:p-8 rounded-[2rem] shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-900">
                <SectionTitle title="Riwayat Perdagangan" colorClass="bg-blue-500" subtitle="Daftar lengkap transaksi Anda" />
                <Filters filterRange={filterRange} setFilterRange={setFilterRange} sortBy={sortBy} setSortBy={setSortBy} />
              </div>
              <JournalTable trades={paginatedTrades} onDeleteTrade={deleteTrade} calculateIDR={calculateIDR} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </section>

          </>
        )}
      </div>
    </div>
  );
}

export default App;
