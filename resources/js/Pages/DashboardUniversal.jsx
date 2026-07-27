import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
  Sprout, 
  Users, 
  MapPin, 
  BadgeCheck,
  XCircle,
  Clock,
  FileText,
  Wheat,
  TrendingUp,
  TrendingDown,
  Search,
  Filter
} from 'lucide-react';

const rupiah = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

// StatCard Komponen
function StatCard({ icon: Icon, label, value, sub, tone = 'emerald' }) {
  const tones = {
    emerald: 'from-emerald-800 to-emerald-950 text-emerald-50',
    amber:   'from-amber-400 to-amber-500 text-emerald-950',
    cream:   'from-[#f5efdf] to-[#ece3c9] text-emerald-950',
    slate:   'from-slate-100 to-slate-200 text-emerald-950',
    red:     'from-red-800 to-red-950 text-red-50',
  };
  return (
    <div className={`rounded-3xl p-5 bg-gradient-to-br ${tones[tone]} shadow-sm border border-emerald-900/5`}>
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-black/10 grid place-items-center">
          <Icon className="w-5 h-5" />
        </div>
        {sub && <span className="text-xs opacity-90 font-medium px-2 py-0.5 rounded-full bg-black/20">{sub}</span>}
      </div>
      <div className="mt-4 text-3xl font-[Sora,ui-sans-serif] font-bold tracking-tight">{value}</div>
      <div className="text-sm opacity-80 mt-1">{label}</div>
    </div>
  );
}

// StatusPill Komponen
function StatusPill({ status }) {
  const map = {
    'Tervalidasi':       'bg-emerald-100 text-emerald-800 border border-emerald-200',
    'Menunggu Validasi': 'bg-amber-100 text-amber-800 border border-amber-200',
    'Ditolak':           'bg-red-100 text-red-700 border border-red-200',
  };
  const Icon = status === 'Tervalidasi' ? BadgeCheck : status === 'Ditolak' ? XCircle : Clock;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-slate-100 text-slate-700'}`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

export default function DashboardUniversal({ user, stats = {}, laporanTerbaru = [] }) {
  // State Filter Tabel 1 (Aktivitas)
  const [searchAktivitas, setSearchAktivitas] = useState('');
  const [statusAktivitas, setStatusAktivitas] = useState('ALL');

  // State Filter Tabel 2 (Hasil Panen)
  const [searchPanen, setSearchPanen] = useState('');
  const [statusPanen, setStatusPanen] = useState('ALL');

  // 1. RAW DATA STRICT FILTER
  const rawAktivitas = useMemo(() => {
    return laporanTerbaru.filter((r) => r.jenis === 'Aktivitas Harian');
  }, [laporanTerbaru]);

  const rawPanen = useMemo(() => {
    return laporanTerbaru.filter((r) => r.jenis === 'Hasil Panen');
  }, [laporanTerbaru]);

  // 2. FILTERED DATA TABEL 1 (Aktivitas Harian)
  const filteredAktivitas = useMemo(() => {
    return rawAktivitas.filter((r) => {
      const matchSearch =
        (r.petani ?? '').toLowerCase().includes(searchAktivitas.toLowerCase()) ||
        (r.blok ?? '').toLowerCase().includes(searchAktivitas.toLowerCase()) ||
        (r.catatan ?? '').toLowerCase().includes(searchAktivitas.toLowerCase());

      const matchStatus = statusAktivitas === 'ALL' || r.status === statusAktivitas;

      return matchSearch && matchStatus;
    });
  }, [rawAktivitas, searchAktivitas, statusAktivitas]);

  // 3. FILTERED DATA TABEL 2 (Hasil Panen)
  const filteredPanen = useMemo(() => {
    return rawPanen.filter((r) => {
      const matchSearch =
        (r.petani ?? '').toLowerCase().includes(searchPanen.toLowerCase()) ||
        (r.blok ?? '').toLowerCase().includes(searchPanen.toLowerCase());

      const matchStatus = statusPanen === 'ALL' || r.status === statusPanen;

      return matchSearch && matchStatus;
    });
  }, [rawPanen, searchPanen, statusPanen]);

  // 4. KALKULASI FINANSIAL: LABA / RUGI (Berdasarkan data Tervalidasi)
  const totalPendapatanPanen = useMemo(() => {
    return rawPanen.reduce((acc, r) => {
      if (r.status === 'Tervalidasi') {
        return acc + Number(r.total_pendapatan || r.biaya || 0);
      }
      return acc;
    }, 0);
  }, [rawPanen]);

  const totalBiayaAktivitas = useMemo(() => {
    return rawAktivitas.reduce((acc, r) => {
      if (r.status === 'Tervalidasi') {
        return acc + Number(r.biaya || 0);
      }
      return acc;
    }, 0);
  }, [rawAktivitas]);

  const labaRugiNet = totalPendapatanPanen - totalBiayaAktivitas;

  // 5. KALKULASI TOTAL PANEN (KG)
  const totalPanenKg = useMemo(() => {
    return rawPanen.reduce((acc, r) => {
      if (r.status === 'Tervalidasi') {
        return acc + Number(r.hasil_panen || 0);
      }
      return acc;
    }, 0);
  }, [rawPanen]);

  // 6. KALKULASI TOTAL LAHAN UNIK
  const totalLahanTabel = useMemo(() => {
    if (!laporanTerbaru || laporanTerbaru.length === 0) return 0;
    const lahanUnik = new Set(
      laporanTerbaru
        .map((r) => r.blok)
        .filter((blok) => blok && blok !== '-')
    );
    return lahanUnik.size;
  }, [laporanTerbaru]);

  return (
    <AppLayout title="Dashboard Universal">
      <Head title="Dashboard Universal — OptimusFarm" />

      {/* Header Greeting */}
      <div className="mb-6">
        <span className="text-sm text-emerald-900/60 font-medium">Selamat datang kembali,</span>
        <h1 className="font-[Sora,ui-sans-serif] text-3xl font-bold tracking-tight text-emerald-950 mt-1">
          {user?.name || 'Pengguna'} 👋
        </h1>
      </div>

      {/* Header Operasional */}
      <div className="flex items-end justify-between mb-4 flex-wrap gap-4">
        <h2 className="font-[Sora,ui-sans-serif] text-2xl font-bold tracking-tight">Ringkasan Operasional</h2>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={MapPin} 
          label="Total Lahan"  
          value={stats.totalLahan ?? totalLahanTabel} 
          tone="emerald" 
        />
        <StatCard 
          icon={Users}  
          label="Total Petani" 
          value={stats.totalPetani ?? 0} 
          tone="cream" 
        />
        <StatCard 
          icon={Sprout} 
          label="Total Panen"  
          value={`${Number(stats.totalPanen ?? totalPanenKg).toLocaleString('id-ID')} kg`} 
          tone="slate" 
        />
        <StatCard 
          icon={labaRugiNet >= 0 ? TrendingUp : TrendingDown} 
          label="Finansial (Laba / Rugi)"    
          value={rupiah(labaRugiNet)} 
          sub={labaRugiNet >= 0 ? "Laba" : "Rugi"}
          tone={labaRugiNet >= 0 ? "amber" : "red"} 
        />
      </div>

      {/* Detail Ringkasan Finansial Laba Rugi */}
      <div className="mt-4 p-4 rounded-2xl bg-white border border-emerald-900/10 shadow-sm flex flex-wrap gap-6 items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-600">Pendapatan Panen:</span>
          <strong className="text-emerald-700 font-semibold">{rupiah(totalPendapatanPanen)}</strong>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span className="text-slate-600">Biaya Harian:</span>
          <strong className="text-red-600 font-semibold">- {rupiah(totalBiayaAktivitas)}</strong>
        </div>
        <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4">
          <span className="text-slate-600">Net:</span>
          <strong className={`font-bold ${labaRugiNet >= 0 ? 'text-emerald-800' : 'text-red-600'}`}>
            {rupiah(labaRugiNet)}
          </strong>
        </div>
      </div>

      {/* TABEL 1: Laporan Aktivitas Harian */}
      <div className="mt-8 rounded-3xl bg-white border border-emerald-900/10 overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-emerald-900/10">
          <h3 className="font-[Sora,ui-sans-serif] text-lg font-bold tracking-tight flex items-center gap-2 shrink-0">
            <FileText className="w-5 h-5 text-emerald-700" /> Laporan Aktivitas Terbaru
          </h3>

          {/* Baris Search & Filter Tabel 1 */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari petani, blok, atau catatan..."
                value={searchAktivitas}
                onChange={(e) => setSearchAktivitas(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
            <div className="relative">
              <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={statusAktivitas}
                onChange={(e) => setStatusAktivitas(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="Tervalidasi">Tervalidasi</option>
                <option value="Menunggu Validasi">Menunggu Validasi</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-emerald-50/60 text-emerald-900/70 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Petani</th>
                <th className="text-left px-6 py-3 font-semibold">Blok</th>
                <th className="text-left px-6 py-3 font-semibold">Jenis</th>
                <th className="text-left px-6 py-3 font-semibold">Biaya Operasional</th>
                <th className="text-left px-6 py-3 font-semibold">Catatan Aktivitas</th>
                <th className="text-left px-6 py-3 font-semibold">Tanggal</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {filteredAktivitas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-emerald-900/50">
                    {searchAktivitas || statusAktivitas !== 'ALL'
                      ? 'Laporan aktivitas tidak ditemukan.'
                      : 'Belum ada laporan aktivitas harian.'}
                  </td>
                </tr>
              )}
              {filteredAktivitas.map((r) => (
                <tr key={r.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-emerald-950">{r.petani}</td>
                  <td className="px-6 py-3.5">
                    <span className="font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs">
                      {r.blok ?? '-'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">{r.jenis}</td>
                  <td className="px-6 py-3.5 font-semibold text-emerald-900">{rupiah(r.biaya)}</td>
                  <td className="px-6 py-3.5 max-w-xs">
                    <div className="flex items-start gap-1.5 text-xs text-emerald-950 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{r.catatan ?? '-'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-emerald-900/70">{r.tanggal}</td>
                  <td className="px-6 py-3.5"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABEL 2: Laporan Hasil Panen */}
      <div className="mt-8 rounded-3xl bg-white border border-emerald-900/10 overflow-hidden shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-emerald-900/10 bg-amber-500/5">
          <h3 className="font-[Sora,ui-sans-serif] text-lg font-bold tracking-tight text-emerald-950 flex items-center gap-2 shrink-0">
            <Wheat className="w-5 h-5 text-amber-600" /> Laporan Hasil Panen
          </h3>

          {/* Baris Search & Filter Tabel 2 */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari petani, atau blok..."
                value={searchPanen}
                onChange={(e) => setSearchPanen(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
              />
            </div>
            <div className="relative">
              <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select
                value={statusPanen}
                onChange={(e) => setStatusPanen(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="Tervalidasi">Tervalidasi</option>
                <option value="Menunggu Validasi">Menunggu Validasi</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50/60 text-emerald-900/70 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Petani</th>
                <th className="text-left px-6 py-3 font-semibold">Blok</th>
                <th className="text-left px-6 py-3 font-semibold">Hasil Panen (kg)</th>
                <th className="text-left px-6 py-3 font-semibold">Total Pendapatan</th>
                <th className="text-left px-6 py-3 font-semibold">Tanggal</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {filteredPanen.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-emerald-900/50">
                    {searchPanen || statusPanen !== 'ALL'
                      ? 'Laporan hasil panen tidak ditemukan.'
                      : 'Belum ada laporan hasil panen.'}
                  </td>
                </tr>
              )}
              {filteredPanen.map((r) => (
                <tr key={r.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-emerald-950">{r.petani}</td>
                  <td className="px-6 py-3.5">
                    <span className="font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs">
                      {r.blok ?? '-'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-amber-700">
                    {Number(r.hasil_panen || 0).toLocaleString('id-ID')} kg
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-emerald-900">{rupiah(r.total_pendapatan || r.biaya)}</td>
                  <td className="px-6 py-3.5 text-emerald-900/70">{r.tanggal}</td>
                  <td className="px-6 py-3.5"><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </AppLayout>
  );
}