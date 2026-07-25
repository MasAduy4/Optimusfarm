import React, { useMemo } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { 
  Sprout, 
  Users, 
  MapPin, 
  Wallet,
  BadgeCheck,
  XCircle,
  Clock,
  FileText,
  Wheat,
  TrendingUp,
  TrendingDown
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
  // 1. FILTER STRICT: Aktivitas Harian (Aktivitas Harian saja)
  const laporanAktivitas = useMemo(() => {
    return laporanTerbaru.filter((r) => r.jenis === 'Aktivitas Harian');
  }, [laporanTerbaru]);

  // 2. FILTER STRICT: Hasil Panen (Hasil Panen saja)
  const laporanPanen = useMemo(() => {
    return laporanTerbaru.filter((r) => r.jenis === 'Hasil Panen');
  }, [laporanTerbaru]);

  // 3. KALKULASI FINANSIAL: LABA / RUGI
  // Total Pendapatan dari Hasil Panen (Tervalidasi)
  const totalPendapatanPanen = useMemo(() => {
    return laporanPanen.reduce((acc, r) => {
      if (r.status === 'Tervalidasi') {
        return acc + Number(r.total_pendapatan || r.biaya || 0);
      }
      return acc;
    }, 0);
  }, [laporanPanen]);

  // Total Biaya dari Aktivitas Harian (Tervalidasi)
  const totalBiayaAktivitas = useMemo(() => {
    return laporanAktivitas.reduce((acc, r) => {
      if (r.status === 'Tervalidasi') {
        return acc + Number(r.biaya || 0);
      }
      return acc;
    }, 0);
  }, [laporanAktivitas]);

  // Net Finansial = Pendapatan Panen - Biaya Harian
  const labaRugiNet = totalPendapatanPanen - totalBiayaAktivitas;

  // 4. KALKULASI TOTAL PANEN (KG)
  const totalPanenKg = useMemo(() => {
    return laporanPanen.reduce((acc, r) => {
      if (r.status === 'Tervalidasi') {
        return acc + Number(r.hasil_panen || 0);
      }
      return acc;
    }, 0);
  }, [laporanPanen]);

  // 5. KALKULASI TOTAL LAHAN UNIK
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/10">
          <h3 className="font-[Sora,ui-sans-serif] text-lg font-bold tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" /> Laporan Aktivitas Terbaru
          </h3>
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
              {laporanAktivitas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-emerald-900/50">
                    Belum ada laporan aktivitas harian.
                  </td>
                </tr>
              )}
              {laporanAktivitas.map((r) => (
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/10 bg-amber-500/5">
          <h3 className="font-[Sora,ui-sans-serif] text-lg font-bold tracking-tight text-emerald-950 flex items-center gap-2">
            <Wheat className="w-5 h-5 text-amber-600" /> Laporan Hasil Panen
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-amber-50/60 text-emerald-900/70 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3 font-semibold">Petani</th>
                <th className="text-left px-6 py-3 font-semibold">Blok</th>
                <th className="text-left px-6 py-3 font-semibold">Komoditas</th>
                <th className="text-left px-6 py-3 font-semibold">Hasil Panen (kg)</th>
                <th className="text-left px-6 py-3 font-semibold">Total Pendapatan</th>
                <th className="text-left px-6 py-3 font-semibold">Tanggal</th>
                <th className="text-left px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/5">
              {laporanPanen.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-emerald-900/50">
                    Belum ada laporan hasil panen.
                  </td>
                </tr>
              )}
              {laporanPanen.map((r) => (
                <tr key={r.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-emerald-950">{r.petani}</td>
                  <td className="px-6 py-3.5">
                    <span className="font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-xs">
                      {r.blok ?? '-'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-medium text-emerald-900">{r.komoditas ?? 'Padi'}</td>
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