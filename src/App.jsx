import React, { useState, useEffect, useMemo } from 'react';
import Calculator from './components/Calculator';
import TransactionForm from './components/TransactionForm';
import JournalTable from './components/JournalTable';
import Dashboard from './components/Dashboard';
import EquityChart from './components/EquityChart';
import Filters from './components/Filters';
import Pagination from './components/Pagination';
import { supabase } from './supabaseClient';
import { RefreshCcw } from 'lucide-react';


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

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterRange, sortBy]);


  // Fetch Initial Data
  const fetchData = async () => {
    setLoading(true);
    try {
      if (!supabase) throw new Error('Supabase not configured');

      // 1. Fetch Trades
      const tradesRes = await supabase.from('trades').select('*').order('date', { ascending: false });
      if (tradesRes.error) throw tradesRes.error;
      const formattedTrades = tradesRes.data.map(t => ({ ...t, pnlCent: t.pnl_cent }));
      setTrades(formattedTrades);

      // 2. Fetch Initial Balance from settings
      const settingsRes = await supabase.from('settings').select('value').eq('key', 'initial_balance').single();
      if (settingsRes.data) {
        setInitialBalance(parseFloat(settingsRes.data.value));
      }
    } catch (error) {
      console.warn('Sync failed, using localStorage:', error.message);
      const savedTrades = localStorage.getItem('cent_journal_trades');
      if (savedTrades) setTrades(JSON.parse(savedTrades));
      const savedBalance = localStorage.getItem('cent_journal_initial_balance');
      if (savedBalance) setInitialBalance(parseFloat(savedBalance));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync Initial Balance to DB (Debounced)
  useEffect(() => {
    localStorage.setItem('cent_journal_initial_balance', initialBalance);

    const syncBalance = async () => {
      if (supabase) {
        await supabase.from('settings').upsert({ key: 'initial_balance', value: initialBalance.toString() });
      }
    };

    const timeoutId = setTimeout(syncBalance, 1000);
    return () => clearTimeout(timeoutId);
  }, [initialBalance]);



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
      setTrades([newTrade, ...trades]);

      // Secondary backup to localStorage
      localStorage.setItem('cent_journal_trades', JSON.stringify([newTrade, ...trades]));
    } catch (error) {
      console.warn('Saving to Local Storage only:', error.message);
      // Fallback: local only if DB fails
      const localTrade = { ...trade, id: Date.now() };
      const updated = [localTrade, ...trades];
      setTrades(updated);
      localStorage.setItem('cent_journal_trades', JSON.stringify(updated));
    }
  };


  const deleteTrade = async (id) => {
    try {
      if (!supabase) throw new Error('Supabase not configured');

      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updated = trades.filter(trade => trade.id !== id);
      setTrades(updated);
      localStorage.setItem('cent_journal_trades', JSON.stringify(updated));
    } catch (error) {
      console.warn('Deleting from Local Storage:', error.message);
      // If it's a numeric ID (local), just filter it
      const updated = trades.filter(trade => trade.id !== id);
      setTrades(updated);
      localStorage.setItem('cent_journal_trades', JSON.stringify(updated));
    }
  };


  const calculateIDR = (cent) => {
    return (cent / CONVERSION_RATE) * IDR_EQUIVALENT;
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
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
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
    <div className="min-h-screen bg-[#050810] text-slate-300 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-900">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-white">
              JURNAL<span className="text-emerald-500 font-light ml-1">CENT</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Pelacak Perdagangan Premium</p>
          </div>
          <Calculator initialBalance={initialBalance} setInitialBalance={setInitialBalance} />
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
